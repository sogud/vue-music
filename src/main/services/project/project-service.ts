import { rmSync, writeFileSync } from 'node:fs'
import type { Composition, Project } from '@shared/types'
import { projectRepository } from '../../storage/repositories/project.repository'
import { createId } from '../../utils/ids'
import { getProjectPaths } from '../../utils/paths'
import { assertValidComposition } from '../composition/composition-validator'

type CreateProjectInput = {
  title: string
  description?: string
  sourceTrackId?: string
  sourceInspirationId?: string
  userIdea?: string
  composition: Composition
}

export class ProjectService {
  create(input: CreateProjectInput): Project {
    assertValidComposition(input.composition)
    const now = Date.now()
    const project: Project = {
      id: createId(),
      title: input.title.trim() || input.composition.title,
      description: input.description?.trim() || input.composition.description,
      sourceTrackId: input.sourceTrackId,
      sourceInspirationId: input.sourceInspirationId,
      userIdea: input.userIdea,
      composition: input.composition,
      createdAt: now,
      updatedAt: now
    }
    projectRepository.save(project)
    this.writeProjectFiles(project)
    return project
  }

  list() {
    return projectRepository.list()
  }

  get(id: string) {
    return projectRepository.getById(id)
  }

  updateComposition(projectId: string, composition: Composition) {
    const previous = this.requireProject(projectId)
    const nextComposition = {
      ...composition,
      updatedAt: Date.now()
    }
    assertValidComposition(nextComposition)
    const updated = projectRepository.updateComposition(projectId, nextComposition)
    if (!updated) throw new Error('Project not found')
    const project = {
      ...updated,
      sourceTrackId: previous.sourceTrackId,
      sourceInspirationId: previous.sourceInspirationId,
      userIdea: previous.userIdea
    }
    this.writeProjectFiles(project)
    return project
  }

  remove(id: string) {
    this.requireProject(id)
    projectRepository.remove(id)
    rmSync(getProjectPaths(id).dir, { recursive: true, force: true })
  }

  writeProjectFiles(project: Project) {
    const paths = getProjectPaths(project.id)
    writeFileSync(paths.compositionPath, JSON.stringify(project.composition, null, 2), 'utf8')
    writeFileSync(
      paths.metadataPath,
      JSON.stringify(
        {
          id: project.id,
          title: project.title,
          description: project.description,
          sourceTrackId: project.sourceTrackId,
          sourceInspirationId: project.sourceInspirationId,
          userIdea: project.userIdea,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        },
        null,
        2
      ),
      'utf8'
    )
  }

  requireProject(id: string) {
    const project = this.get(id)
    if (!project) throw new Error('Project not found')
    return project
  }
}

export const projectService = new ProjectService()
