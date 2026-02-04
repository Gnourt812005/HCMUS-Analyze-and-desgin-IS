# Convention

## Commit Message Format

### Design and Analysis Phase

```
<Type of diagram>/<Name>: <detail>
```

**Examples:**
- `activity/truong: phien ban 1`
- `activity/truong: update something`
- `use-case/user-management: add authentication flow`
- `sequence/payment: update error handling`

## Folder Structure

### Documentation (`doc/`)

```
doc/
├── business/
│   ├── activity/       # Activity diagrams
│   ├── use-case/       # Use case diagrams
│   ├── sequence/       # Sequence diagrams
│   └── class/          # Class diagrams
├── design/
└── requirements/
```

**Note:** Source code structure (`src/`) will be defined during development phase.

