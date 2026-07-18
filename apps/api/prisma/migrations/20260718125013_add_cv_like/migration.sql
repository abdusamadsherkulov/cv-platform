-- CreateTable
CREATE TABLE "CVLike" (
    "id" SERIAL NOT NULL,
    "cvId" INTEGER NOT NULL,
    "recruiterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CVLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CVLike_cvId_recruiterId_key" ON "CVLike"("cvId", "recruiterId");

-- AddForeignKey
ALTER TABLE "CVLike" ADD CONSTRAINT "CVLike_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVLike" ADD CONSTRAINT "CVLike_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
