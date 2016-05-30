PROJECTNAME = claps
HOMEDIR = $(shell pwd)
USER = bot
SERVER = smidgeo
SSHCMD = ssh $(USER)@$(SERVER)
APPDIR = /opt/$(PROJECTNAME)

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt --exclude node_modules/ --exclude data/
	$(SSHCMD) "cd $(APPDIR) && npm install"

run:
	node post-tweet-chain.js

pushall: sync
	git push origin master
