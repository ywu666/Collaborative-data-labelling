FROM python:3.7-alpine
RUN apk update && apk add --no-cache gcc libc-dev make git libffi-dev openssl-dev python3-dev libxml2-dev libxslt-dev musl-dev linux-headers build-base alpine-sdk
WORKDIR .
ENV PYTHONPATH="."
ENV FLASK_APP="main.py"
ENV FLASK_ENV="development"
ENV FLASK_RUN_HOST="0.0.0.0"
COPY . ./
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["flask", "run"]