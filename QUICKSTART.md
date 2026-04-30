БЫСТРЫЙ СТАРТ

1. Деплой инфраструктуры:
kubectl apply -k infrastructure/postgres/kustomize/overlays/dev
kubectl apply -k infrastructure/redis/kustomize/base

2. Деплой приложения:
kubectl apply -k app/kustomize/overlays/dev

3. Доступ:
kubectl port-forward -n todo-dev service/frontend 8080:80

4. Открыть браузер:
http://localhost:8080

5. Проверка health:
kubectl exec -n todo-dev deployment/backend -- curl -s http://localhost:5000/health

6. Логи:
kubectl logs -n todo-dev -f deployment/backend
