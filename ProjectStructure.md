PS X:\PotuPartners Law> tree /F
Folder PATH listing for volume 182
Volume serial number is 0000000E 2CCA:0BA8
X:.
│   .gitignore
│   docker-compose.yml
│   ecosystem.config.js
│   MIGRATION_GUIDE.md
│   Privacy & Policy
│   ProjectStructure.md
│   README.md
│   SECURITY_CHECKLIST.md
│   
├───.do
│       app.yaml
│       
├───.github
│   │   SECRETS_REFERENCE.md
│   │   
│   └───workflows
│           deploy-backend.yml
│           deploy-frontend.yml
│           
├───.vscode
│       extensions.json
│       tasks.json
│       
├───backend
│   │   .env.example
│   │   Dockerfile
│   │   package-lock.json
│   │   package.json
│   │   tsconfig.json
│   │   
│   ├───migrations
│   │       001_create_users.sql
│   │       002_create_refresh_tokens.sql
│   │       003_create_conversations.sql
│   │       004_create_messages.sql
│   │       005_create_files_and_rag.sql
│   │       
│   └───src
│       │   index.ts
│       │   
│       ├───config
│       │       database.ts
│       │       env.ts
│       │       storage.ts
│       │       
│       ├───db
│       │       migrate.ts
│       │       
│       ├───middleware
│       │       auth.middleware.ts
│       │       upload.middleware.ts
│       │       
│       ├───modules
│       │   ├───admin
│       │   │       admin.routes.ts
│       │   │       admin.service.ts
│       │   │       ai.routes.ts
│       │   │       ai.service.ts
│       │   │       
│       │   ├───auth
│       │   │       auth.controller.ts
│       │   │       auth.routes.ts
│       │   │       auth.service.ts
│       │   │       
│       │   ├───conversations
│       │   │       conversations.routes.ts
│       │   │       conversations.service.ts
│       │   │       
│       │   ├───files
│       │   │       files.routes.ts
│       │   │       files.service.ts
│       │   │       
│       │   ├───messages
│       │   │       messages.routes.ts
│       │   │       messages.service.ts
│       │   │       
│       │   └───users
│       │           users.routes.ts
│       │           users.service.ts
│       │           
│       ├───scripts
│       │       seed.ts
│       │       
│       ├───socket
│       │       chatHandler.ts
│       │       
│       ├───types
│       │       index.ts
│       │       
│       └───utils
│               auth.ts
│               errors.ts
│               logger.ts
│               validators.ts
│               
├───frontend
│   │   next-env.d.ts
│   │   next.config.js
│   │   package-lock.json
│   │   package.json
│   │   postcss.config.js
│   │   README.md
│   │   tailwind.config.js
│   │   tsconfig.json
│   │   vercel.json
│   │   
│   ├───public
│   │   │   adrian.png
│   │   │   albert.png
│   │   │   alifia.jpg
│   │   │   case1.png
│   │   │   case2.png
│   │   │   case3.png
│   │   │   dimas.png
│   │   │   e6b15be7-a4eb-48b5-bf27-308e5f674aaa
│   │   │   gesang.jpg
│   │   │   immanuel.jpg
│   │   │   lady-of-justice-desktop.png
│   │   │   lady-of-justice.png
│   │   │   logo.png
│   │   │   manifest.json
│   │   │   marchellina.jpg
│   │   │   mario.jpg
│   │   │   miswar.jpg
│   │   │   rolland.png
│   │   │   sw.js
│   │   │   torch-logo.png
│   │   │   vanessa.jpg
│   │   │   workbox-00a24876.js
│   │   │   
│   │   ├───.well-known
│   │   │       assetlinks.json
│   │   │       
│   │   ├───client
│   │   │       client01.png
│   │   │       client02.png
│   │   │       client03.png
│   │   │       client04.png
│   │   │       client05.png
│   │   │       client06.png
│   │   │       client07.png
│   │   │       client08.png
│   │   │       
│   │   ├───icons
│   │   │       icon-128.png
│   │   │       icon-144.png
│   │   │       icon-152.png
│   │   │       icon-192.png
│   │   │       icon-384.png
│   │   │       icon-512.png
│   │   │       icon-72.png
│   │   │       icon-96.png
│   │   │       
│   │   └───screenshots
│   │           desktop.png
│   │           mobile.png
│   │           
│   └───src
│       ├───app
│       │   │   globals.css
│       │   │   icon.svg
│       │   │   layout.tsx
│       │   │   page.tsx
│       │   │   
│       │   └───admin
│       │           layout.tsx
│       │           page.tsx
│       │           
│       ├───components
│       │   ├───chat
│       │   │       AuthGate.tsx
│       │   │       ChatButton.tsx
│       │   │       ChatPanel.tsx
│       │   │       ChatSidebar.tsx
│       │   │       ChatWindow.tsx
│       │   │       ContactSelector.tsx
│       │   │       FileUpload.tsx
│       │   │       MessageBubble.tsx
│       │   │       TypingIndicator.tsx
│       │   │       
│       │   ├───layout
│       │   │       Footer.tsx
│       │   │       Navbar.tsx
│       │   │       
│       │   └───sections
│       │           AboutOffice.tsx
│       │           CaseHighlights.tsx
│       │           Client.tsx
│       │           Hero.tsx
│       │           Mission.tsx
│       │           Partners.tsx
│       │           Services.tsx
│       │           Vision.tsx
│       │           
│       ├───hooks
│       │       useAuth.ts
│       │       useChat.ts
│       │       useFileUpload.ts
│       │       useReveal.ts
│       │       useSocket.ts
│       │       
│       ├───lib
│       │       socket.ts
│       │       utils.ts
│       │       
│       ├───services
│       │       api.ts
│       │       
│       ├───store
│       │       authStore.ts
│       │       chatStore.ts
│       │       
│       └───types
│               index.ts
│               
├───nginx
│       potupartners.conf
│       
├───pwa
│       assetlinks.json
│       twa-manifest.json
│       
├───rag-service
│   │   .env.example
│   │   Dockerfile
│   │   requirements.txt
│   │   
│   └───app
│       │   config.py
│       │   main.py
│       │   
│       ├───models
│       │       schemas.py
│       │       
│       ├───routes
│       │       ingest.py
│       │       query.py
│       │       
│       └───services
│               chunker.py
│               document_processor.py
│               embedder.py
│               llm.py
│               vector_store.py
│               
└───scripts
        setup.sh
        
PS X:\PotuPartners Law> 