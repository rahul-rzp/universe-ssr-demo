FROM c.rzp.io/proxy_dockerhub/library/node:14

ARG APP_NAME
ARG STAGE
ARG AWS_S3_BUCKET_NAME
ARG AWS_DEFAULT_REGION
ARG VERSION

ENV APP_NAME=$APP_NAME
ENV STAGE=$STAGE
ENV AWS_S3_BUCKET_NAME=$AWS_S3_BUCKET_NAME
ENV AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION
ENV VERSION=$VERSION

RUN apt-get update && apt-get install -y ca-certificates

EXPOSE 8888
	
# Setup AWS CLI
RUN apt-get update && apt-get install -y awscli

# Create app directory
RUN mkdir /$APP_NAME && chown -R node:node /$APP_NAME

WORKDIR /$APP_NAME

# Copy dependencies files so we can have better caching as these don't change often
COPY --chown=node:node .npmrc package.json yarn.lock ./

# Install strictly from lockfile don't generate new lockfile
RUN --mount=type=secret,id=GITHUB_ACCESS_TOKEN \
    GITHUB_ACCESS_TOKEN=$(cat /run/secrets/GITHUB_ACCESS_TOKEN) && \
    export GITHUB_ACCESS_TOKEN && \
    yarn install --frozen-lockfile

# Copy app source
COPY --chown=node:node . ./

# Yolo the npmrc out now because it will try to replace git token (for each npm command) which won't be present in env anymore
RUN rm -f .npmrc

# Build the app source. This command will run during docker build
RUN --mount=type=secret,id=GITHUB_ACCESS_TOKEN \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    GITHUB_ACCESS_TOKEN=$(cat /run/secrets/GITHUB_ACCESS_TOKEN) && \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
    export GITHUB_ACCESS_TOKEN && \
    export SENTRY_AUTH_TOKEN && \
    yarn $STAGE:build

# Upload build assets to S3
RUN --mount=type=secret,id=AWS_ACCESS_KEY_ID \
    --mount=type=secret,id=AWS_SECRET_ACCESS_KEY \
    --mount=type=secret,id=AWS_SESSION_TOKEN \
    AWS_ACCESS_KEY_ID=$(cat /run/secrets/AWS_ACCESS_KEY_ID) && \
    AWS_SECRET_ACCESS_KEY=$(cat /run/secrets/AWS_SECRET_ACCESS_KEY) && \
    AWS_SESSION_TOKEN=$(cat /run/secrets/AWS_SESSION_TOKEN) && \
    export AWS_ACCESS_KEY_ID && \
    export AWS_SECRET_ACCESS_KEY && \
    export AWS_SESSION_TOKEN && \
    aws s3 cp --cache-control "public, max-age=31536000" --recursive ./build/browser s3://$AWS_S3_BUCKET_NAME/build/browser --exclude "*.map"

# Serve the app. This command will run during docker run
CMD yarn $STAGE:serve
