ПРИЛОЖЕНИЕ ЧЕРЕЗ KUSTOMIZE

СТРУКТУРА:
base/ - манифесты backend и frontend
overlays/dev/ - dev окружение с DATABASE_URL
overlays/prod/ - prod окружение с DATABASE_URL

ДЕПЛОЙ DEV:
kubectl apply -k app/kustomize/overlays/dev

ДЕПЛОЙ PROD:
kubectl apply -k app/kustomize/overlays/prod

ПРОСМОТР МАНИФЕСТОВ:
kubectl kustomize app/kustomize/overlays/dev

УДАЛЕНИЕ:
kubectl delete -k app/kustomize/overlays/dev
