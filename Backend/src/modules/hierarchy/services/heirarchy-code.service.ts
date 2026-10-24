import { EntityManager, Repository } from "typeorm";
import { HierarchyCodeSequence } from "../entities/heirarchy-code-sequence.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class HierarchyCodeSequenceService {

  constructor(
    @InjectRepository(HierarchyCodeSequence)
    private readonly sequenceRepository: Repository<HierarchyCodeSequence>
  ){}

  async generateCode(parentCode: string, prefix: string, padding: number, manager?: EntityManager){

    const Repository = manager? 
      manager.getRepository(HierarchyCodeSequence)
      : this.sequenceRepository;

    let sequence = await this.sequenceRepository.findOne({
      where:{
        parentCode,
        prefix,
      }
    })

    if(!sequence){
      sequence = this.sequenceRepository.create({
        parentCode,
        prefix, 
        lastNumber: 0,
      })
    }

    sequence.lastNumber +=1;

    await Repository.save(sequence);

    const endNumber = sequence.lastNumber.toString().padStart(padding, '0');

    return `${parentCode}.${prefix}${endNumber}`;

  }

}