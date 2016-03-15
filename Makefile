HOMEDIR = $(shell pwd)

SSHCMD = ssh $(SMUSER)@smidgeo-headporters
APPDIR = /var/apps/claps

pushall: sync set-permissions
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@smidgeo-headporters:/var/apps/ --exclude node_modules/ --exclude data/
	ssh $(SMUSER)@smidgeo-headporters "cd /var/apps/claps && npm install"

restart-remote:
	$(SSHCMD) "systemctl restart claps"

set-permissions:
	$(SSHCMD) "chmod +x /var/apps/claps/claps-responder.js && \
	chmod 777 -R /var/apps/claps/data"

update-remote: sync set-permissions restart-remote

install-service:
	$(SSHCMD) "cp $(APPDIR)/claps.service /etc/systemd/system && \
	systemctl daemon-reload"
