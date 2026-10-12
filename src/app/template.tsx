/** Recréé à chaque changement de page : le contenu apparaît en fondu au lieu de surgir d'un coup. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
