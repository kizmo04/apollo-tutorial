import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';
import { Router } from '@reach/router';

import { Home, Login, Launch, Cart } from './pages';
import Header from './components/header';

// Set up our apollo-client to point at the server we created
// this can be local or a remote endpoint
const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      authorization: localStorage.getItem('token'),
    },
  }),
  storeInitializers: {
    isLoggedIn: () => !!localStorage.getItem('token'),
    cartItems: () => [1],
  },
  resolvers: {
    Query: {
      isLoggedIn: async () => {
        return await !!localStorage.getItem('token');
      },
    },
    Launch: {
      isInCart: (launch, _, { cache }) => {
        console.log('hey');
        return false;
        // const query = gql`
        //   query Cart {
        //     cartItems @client
        //   }
        // `;
        // console.log({ launch });

        // const { cartItems } = cache.readQuery({ query });

        // console.log({ cartItems });

        // return cartItems.includes(launch.id);
      },
    },
    Mutation: {
      addToCart: (_, { id }, { cache }) => {
        const query = gql`
          query Cart {
            cartItems @client
          }
        `;

        const { cartItems } = cache.readQuery({ query });
        const data = {
          cartItems: cartItems.includes(id)
            ? cartItems.filter(i => !i)
            : [...cartItems, id],
        };
        cache.writeQuery({ query, data });
        return data.cartItems;
      },
    },
  },
});

/**
 * Render our app
 * - We wrap the whole app with ApolloProvider, so any component in the app can
 *    make GraphqL requests. Our provider needs the client we created above,
 *    so we pass it as a prop
 * - We need a router, so we can navigate the app. We're using Reach router for this.
 *    The router chooses between which component to render, depending on the url path.
 *    ex: localhost:3000/login will render only the `Login` component
 */

ReactDOM.render(
  <ApolloProvider client={client}>
    <Header />
    <Router>
      <Home path="/" />
      <Login path="login" />
      <Launch path="launch/:launchId" />
      <Cart path="cart" />
    </Router>
  </ApolloProvider>,
  document.getElementById('root'),
);
