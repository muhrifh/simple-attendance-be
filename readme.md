## Getting Started
How to run the `development server`.

```bash
1. npm install
2. copy envfiles/.env.development to root dir with name .env
3. make .vscode folder in root dir
4. copy envfiles/.vscode.settings.json rename to settings.json
5. execute database PostgreSQL script table and data
6. recheck the .env DB parameters
7. running with >> npm run dev
```
Port based on .env and default was [http://localhost:3334](http://localhost:3334).

## Development
```bash
1. git add
2. git commit -m ""
3. update version in package.json {optional} git tag v1.0.0 
4. git push
5. {if tag updated} >> git push origin tag v1.0.0
```

Make sure to follow the versioning rule, <b>v[Major].[Minor].[Patch]</b>

### Major
For major features or changes. Changes can be breaking.

### Minor
For minor features

### Patch
For bug fixes, and minor improvements.


## Deployment
Two step to `build this project`.
```bash
1. npm install
2. npm run build
```
