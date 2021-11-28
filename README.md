# Apollo Rover Introspect Action

A GitHub Action to introspect a server and save the schema using the Apollo [Rover CLI](https://www.apollographql.com/docs/rover/).

Depends upon service containers (published to a registry) to communicate with the Apollo service because of the lack of background job support in GitHub Actions.

Works in tandem with:
- [rover-fetch](https://github.com/DanielSinclair/rover-fetch)
- [rover-publish](https://github.com/DanielSinclair/rover-publish)

## inputs
| name        | default | required               | description         |
| :---------- | :------ | :--------------------- | :------------------ |
| federated   | false   | no                     | boolean             |
| subgraph    |         | no, if federated false | string              |
| server      |         | yes                    | url string          |
| headers     |         | no                     | JSON-encoded string |

## outputs
| name   | description                |
| :----- | :------------------------- |
| schema | base64 encoded fetched SDL |

## Usage
```
jobs:
  introspect:
    runs-on: ubuntu-latest
    services:
      apollo:
        image: danielsinclair/apollo-example
    steps:
    - uses: danielsinclair/rover-introspect@v1
      with:
        federated: true
        subgraph: products
        server: http://apollo:3000/
        headers: |
          {"token": "s3cr3t"}
      env:
        APOLLO_KEY: ${{ secrets.APOLLO_KEY }}
```

Introspected schema is saved to `products.graphql` artifact
