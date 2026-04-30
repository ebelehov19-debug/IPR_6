IPR_6 - ЛАБОРАТОРНАЯ РАБОТА 6

СТРУКТУРА:
- backend/ - код из ЛР5
- frontend/ - код из ЛР5
- infrastructure/ - PostgreSQL + Redis (отдельно)
- app/ - только приложение (Kustomize + Helm)

КОНТРАКТ С БД:
Хост: postgres-headless.todo-dev.svc.cluster.local
Порт: 5432
БД: todoapp
Пользователь: todo_user
Пароль: todo_pass

DATABASE_URL:
postgresql://todo_user:todo_pass@postgres-headless.todo-dev.svc.cluster.local:5432/todoapp

ДЕПЛОЙ:
1. kubectl apply -k infrastructure/postgres/kustomize/overlays/dev
2. kubectl apply -k infrastructure/redis/kustomize/base
3. kubectl apply -k app/kustomize/overlays/dev

ИЛИ ЧЕРЕЗ HELM:
helm install todo-app ./app/helm/todo-app -f ./app/helm/todo-app/values/dev.yaml --namespace todo-dev --create-namespace

ПРОВЕРКА:
kubectl get pods -n todo-dev
kubectl port-forward -n todo-dev service/frontend 8080:80

HEALTH CHECKS:
kubectl exec -n todo-dev deployment/backend -- curl -s http://localhost:5000/health
