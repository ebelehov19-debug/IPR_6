HELM ЧАРТ ДЛЯ TODO APP

УСТАНОВКА DEV:
helm install todo-app . -f values/dev.yaml --namespace todo-dev --create-namespace

УСТАНОВКА PROD:
helm install todo-app . -f values/prod.yaml --namespace todo-prod --create-namespace

ОБНОВЛЕНИЕ:
helm upgrade todo-app . -f values/dev.yaml

ПРОСМОТР ШАБЛОНОВ:
helm template todo-app . -f values/dev.yaml

ОТКАТ:
helm rollback todo-app

УДАЛЕНИЕ:
helm uninstall todo-app -n todo-dev

ПАРАМЕТРЫ:
backend.replicas - количество реплик backend
frontend.replicas - количество реплик frontend
database.host - хост PostgreSQL
