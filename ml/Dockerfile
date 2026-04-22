FROM python:3.11-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . .

# Render injects the PORT env variable at runtime
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
