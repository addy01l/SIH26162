FROM postgis/postgis:15-3.3

# Install dependencies to compile h3-pg
RUN apt-get update && apt-get install -y \
    postgresql-server-dev-15 \
    make \
    cmake \
    gcc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Clone and install h3-pg (H3 PostGIS bindings)
RUN git clone https://github.com/zachasme/h3-pg.git /tmp/h3-pg \
    && cd /tmp/h3-pg \
    && make \
    && make install \
    && rm -rf /tmp/h3-pg

COPY init.sql /docker-entrypoint-initdb.d/
