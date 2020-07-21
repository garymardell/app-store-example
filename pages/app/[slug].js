import { useRouter } from 'next/router'
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag'
import fetch from 'node-fetch';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: 'https://flourish-app-store.herokuapp.com/api/graphql.json',
  fetch: fetch
});

const client = new ApolloClient({
  cache: cache,
  link: link,
});

export async function getStaticPaths() {
  const { data } = await client.query({
    query: gql`
      query {
        apps {
          slug
        }
      }
    `
  })

  const paths = data.apps.map((app) => ({
    params: { slug: app.slug }
  }))

  return { paths, fallback: true }
}

// params will contain the id for each generated page.
export async function getStaticProps({ params }) {
  const { data } = await client.query({
    query: gql`
      query($slug: String!) {
        app(slug: $slug) {
          slug
          name
        }
      }
    `,
    variables: {
      slug: params.slug
    }
  })

  return {
    props: {
      app: data.app
    },
    unstable_revalidate: 60
  }
}

export default function App({ app }) {
  const router = useRouter()

  return (
    <div>
      {router.isFallback ? (
        <span>Loading</span>
      ) : (
        <h1>{app.name}</h1>
      )}
    </div>
  )
}