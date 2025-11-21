-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_emission_factors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'CUSTOM',
    "region" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "factorValue" REAL NOT NULL,
    "factorUnit" TEXT NOT NULL,
    "gas" TEXT NOT NULL DEFAULT 'CO2',
    "gwp" REAL NOT NULL DEFAULT 1,
    "validityStart" DATETIME,
    "validityEnd" DATETIME,
    "reference" TEXT,
    "methodology" TEXT,
    "assumptions" TEXT NOT NULL DEFAULT '{}',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "emission_factors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_emission_factors" ("activityType", "assumptions", "createdAt", "deletedAt", "description", "factorUnit", "factorValue", "gas", "gwp", "id", "isActive", "isDefault", "metadata", "methodology", "organizationId", "priority", "reference", "region", "source", "unit", "updatedAt", "validityEnd", "validityStart", "year") SELECT "activityType", "assumptions", "createdAt", "deletedAt", "description", "factorUnit", "factorValue", "gas", "gwp", "id", "isActive", "isDefault", "metadata", "methodology", "organizationId", "priority", "reference", "region", "source", "unit", "updatedAt", "validityEnd", "validityStart", "year" FROM "emission_factors";
DROP TABLE "emission_factors";
ALTER TABLE "new_emission_factors" RENAME TO "emission_factors";
CREATE INDEX "emission_factors_activityType_region_year_idx" ON "emission_factors"("activityType", "region", "year");
CREATE INDEX "emission_factors_organizationId_activityType_idx" ON "emission_factors"("organizationId", "activityType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
