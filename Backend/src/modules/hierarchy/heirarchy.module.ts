import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HierarchyCodeSequence } from "./entities/heirarchy-code-sequence.entity";
import { HierarchyCodeSequenceService } from "./services/heirarchy-code.service";

@Module({
  imports: [TypeOrmModule.forFeature([HierarchyCodeSequence])],
  controllers: [],
  providers: [HierarchyCodeSequenceService],
  exports: [HierarchyCodeSequenceService],
})
export class HeirarchyModule{}