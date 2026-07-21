from fastapi import FastAPI
import routers

app = FastAPI()

# Mounts the endpoints under the /documents path
app.include_router(routers.document_router)
app.include_router(routers.jumper_router)