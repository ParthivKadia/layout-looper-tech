# React Website Clone

https://www.wix.com/website-template/view/html/wh-1091?originUrl=https%3A%2F%2Fwww.wix.com%2Fwebsite%2Ftemplates%3Fcriteria%3Dcrm&tpClick=view_button&esi=9bfbbdd1-fa18-411d-8bf2-a32da6dc76e1

clone these entire site in react+vite+typescript+tailwind folder structure
make each components in such a way that i can edit from my side like i can edit size color widh height like that all
and preapre these site exact theme in proper file
clone entire site including color typography theme and all
and make these clone website mobile tablet and laptop responsive

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/793a0b88-b4f6-4b48-865f-e1d0c830b658).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

```
docker build \
  --platform linux/amd64 \
  -t neelcontractor3/grahaura-main-site:latest .
```

```
docker push neelcontractor3/grahaura-main-site:latest
```

server run command 
```bash
docker run -d --name grahaura-main-site   -p 8081:8080   -e VITE_API_BASE_URL=https://api.storely.co.in   --restart unless-stopped   neelcontractor3/grahaura-main-site:latest
docker run -d --name grahaura-main-site   -p 8081:8081  --restart unless-stopped   neelcontractor3/grahaura-main-site:latest
or
docker run -d --name grahaura-main-site \
  -p 0.0.0.0:8081:8081 \
  --restart unless-stopped \
  neelcontractor3/grahaura-main-site:latest
```
