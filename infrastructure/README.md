ИНФРАСТРУКТУРА POSTGRESQL + REDIS

POSTGRESQL КОНТРАКТ:
Хост: postgres-headless.todo-dev.svc.cluster.local
Порт: 5432
БД: todoapp
Пользователь: todo_user
Пароль: todo_pass

REDIS КОНТРАКТ:
Хост: redis.todo-dev.svc.cluster.local
Порт: 6379

ДЕПЛОЙ:
kubectl apply -k infrastructure/postgres/kustomize/overlays/dev
kubectl apply -k infrastructure/redis/kustomize/base

ПРОВЕРКА:
kubectl get statefulset,pods,pvc -n todo-dev
kubectl exec -n todo-dev statefulset/postgres -- psql -U todo_user -d todoapp -c "\dt"
