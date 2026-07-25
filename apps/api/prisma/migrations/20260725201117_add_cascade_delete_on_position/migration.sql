-- DropForeignKey
ALTER TABLE "CV" DROP CONSTRAINT "CV_positionId_fkey";

-- DropForeignKey
ALTER TABLE "CVLike" DROP CONSTRAINT "CVLike_cvId_fkey";

-- DropForeignKey
ALTER TABLE "DiscussionPost" DROP CONSTRAINT "DiscussionPost_positionId_fkey";

-- DropForeignKey
ALTER TABLE "PositionAccessRule" DROP CONSTRAINT "PositionAccessRule_positionId_fkey";

-- DropForeignKey
ALTER TABLE "PositionAttribute" DROP CONSTRAINT "PositionAttribute_positionId_fkey";

-- AddForeignKey
ALTER TABLE "PositionAttribute" ADD CONSTRAINT "PositionAttribute_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionAccessRule" ADD CONSTRAINT "PositionAccessRule_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CV" ADD CONSTRAINT "CV_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionPost" ADD CONSTRAINT "DiscussionPost_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CVLike" ADD CONSTRAINT "CVLike_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
