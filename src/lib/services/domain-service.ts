import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { getSiteById } from "./site-service";

export async function listSiteDomains(siteId: string) {
  await getSiteById(siteId);
  return prisma.siteCustomDomain.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addCustomDomain(input: {
  siteId: string;
  domain: string;
  isPrimary?: boolean;
}) {
  await getSiteById(input.siteId);
  const domain = input.domain.toLowerCase().replace(/^www\./, "");

  const existing = await prisma.siteCustomDomain.findUnique({ where: { domain } });
  if (existing) throw new ConflictError(`Domain "${domain}" is already registered`);

  const verificationToken = `tws-verify=${randomBytes(16).toString("hex")}`;

  return prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.siteCustomDomain.updateMany({
        where: { siteId: input.siteId },
        data: { isPrimary: false },
      });
    }

    return tx.siteCustomDomain.create({
      data: {
        siteId: input.siteId,
        domain,
        isPrimary: input.isPrimary ?? false,
        verificationToken,
        verificationStatus: "PENDING",
      },
    });
  });
}

export async function verifyCustomDomain(domainId: string) {
  const record = await prisma.siteCustomDomain.findUnique({ where: { id: domainId } });
  if (!record) throw new NotFoundError("Domain record not found");

  return prisma.siteCustomDomain.update({
    where: { id: domainId },
    data: {
      verificationStatus: "VERIFIED",
      verifiedAt: new Date(),
    },
  });
}

export async function removeCustomDomain(domainId: string) {
  const record = await prisma.siteCustomDomain.findUnique({ where: { id: domainId } });
  if (!record) throw new NotFoundError("Domain record not found");
  return prisma.siteCustomDomain.delete({ where: { id: domainId } });
}

export function getDnsInstructions(domain: string, platformDomain: string) {
  return {
    domain,
    records: [
      {
        type: "CNAME",
        name: domain.startsWith("www.") ? "www" : "@",
        value: platformDomain,
        note: "Point your domain to the platform host. Exact steps depend on your DNS provider.",
      },
      {
        type: "TXT",
        name: "_tws-verify",
        value: "Add verification token from domain record after creation",
        note: "Used to verify domain ownership before going live.",
      },
    ],
  };
}
