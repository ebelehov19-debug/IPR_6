ПОРЯДОК ДЕПЛОЯ

ШАГ 1 - СОБРАТЬ ОБРАЗЫ:
cd ~/IPR_6
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

ШАГ 2 - ДЕПЛОЙ ИНФРАСТРУКТУРЫ:
kubectl apply -k infrastructure/postgres/kustomize/overlays/dev
kubectl apply -k infrastructure/redis/kustomize/base

ШАГ 3 - ДЕПЛОЙ ПРИЛОЖЕНИЯ (KUSTOMIZE):
kubectl apply -k app/kustomize/overlays/dev

ШАГ 4 - ПРОВЕРКА:
kubectl get pods -n todo-dev
kubectl logs -n todo-dev -l app=backend
kubectl port-forward -n todo-dev service/frontend 8080:80

ШАГ 5 - ОЧИСТКА:
kubectl delete -k app/kustomize/overlays/dev
kubectl delete -k infrastructure/postgres/kustomize/overlays/dev
kubectl delete -k infrastructure/redis/kustomize/base
