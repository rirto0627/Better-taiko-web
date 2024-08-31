FROM python@sha256:b53f496ca43e5af6994f8e316cf03af31050bf7944e0e4a308ad86c001cf028b
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY ./tools/get_version.sh /app/tools/get_version.sh

#RUN cp config.py config.py
#RUN /app/tools/get_version.sh
CMD ["/app/tools/get_version.sh"]
# Create entrypoint script
RUN echo '#!/bin/bash\n\
python manage.py db upgrade\n\
python app.py "$@"' > /app/entrypoint.sh && \
chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]