-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT,
    "message" TEXT NOT NULL,
    "rawError" TEXT,
    "topic" TEXT,
    "ip" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt");

-- CreateIndex
CREATE INDEX "ErrorLog_category_idx" ON "ErrorLog"("category");

-- CreateIndex
CREATE INDEX "ErrorLog_provider_idx" ON "ErrorLog"("provider");
