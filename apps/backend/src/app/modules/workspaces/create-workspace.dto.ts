import { WorkspaceVisibility } from '@dializer/types';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDTO {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional({ enum: WorkspaceVisibility })
  visibility?: WorkspaceVisibility;

  @ApiPropertyOptional()
  description?: string;
}
