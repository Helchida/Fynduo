import { useEffect } from "react";
import { migrateComptesMensuels } from "../scripts/migration";

export default function MigratePage() {
  useEffect(() => {
    migrateComptesMensuels();
  }, []);

  return <div>Migrating... check console</div>;
}
