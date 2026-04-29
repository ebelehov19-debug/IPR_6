## ШАГ1
``cd Lab3``

### Сборка backend
``cd backend``
``docker build -t todo-backend:latest .``

# Сборка frontend  
``cd ../frontend``
``docker build -t todo-frontend:latest .``

``cd ..``
## Шаг 2: Применение манифестов
```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

## 3

### Проверка всех ресурсов
```kubectl get all -n todo-app```

### Проверка подов
``kubectl get pods -n todo-app -w``

### Проверка логов
``kubectl logs -n todo-app -l app=backend``

### Доступ к приложению
``kubectl port-forward -n todo-app service/frontend-service 8080:80``
# Открыть: http://localhost:8080