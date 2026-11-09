// Roles jerárquicos: cada nivel puede todo lo del nivel inferior.
export const NIVEL = { MIEMBRO: 1, MODERADOR: 2, ADMIN: 3, SUPERADMIN: 4 } as const;
export type Nivel = 1 | 2 | 3 | 4;

// Los nombres de cada rol están en el diccionario (t.roles[nivel]).
export const ROLES: Record<Nivel, { color: string }> = {
  1: { color: "bg-white/10 text-white/70" },
  2: { color: "bg-sky/20 text-sky" },
  3: { color: "bg-gold/20 text-gold" },
  4: { color: "bg-flame/25 text-flame" },
};

/** ¿Puede `actor` actuar sobre alguien de nivel `objetivo`? Nadie toca a su igual o superior. */
export function puedeGestionar(actor: number, objetivo: number) {
  return actor > objetivo;
}

/** Nivel máximo que `actor` puede asignar: el superadmin puede nombrar superadmins; el resto, solo por debajo de sí. */
export function nivelMaximoAsignable(actor: number) {
  return actor >= NIVEL.SUPERADMIN ? NIVEL.SUPERADMIN : actor - 1;
}
