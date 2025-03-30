import { cms_manager } from '@prisma/client';

export class ManagerVO {
  constructor(
    public id: number,
    public username: string,
    public role: number,
    public created_at: Date,
  ) {}
}

export function toManagerVO(m: cms_manager): ManagerVO {
  if (!m) return null;
  return new ManagerVO(m.id, m.username, m.role, m.created_at);
}
