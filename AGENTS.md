# Coordinación de Agentes

Este archivo mantiene el protocolo de coordinación cuando Claude Code y Google Antigravity interactúan en el mismo repositorio.

1. Antes de iniciar cualquier tarea, se debe hacer `git status` y `git pull`.
2. Las tareas terminadas o el progreso se documentan en `HANDOFF.md` al finalizar la sesión.
3. Para despliegues (Vercel), asegúrate de que el repositorio de GitHub está vinculado correctamente ejecutando `vercel project inspect los-plomeros`. Si no lo está, despliega manualmente con `npx vercel --prod --yes`.
