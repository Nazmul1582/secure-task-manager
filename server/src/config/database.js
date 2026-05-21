import dns from 'node:dns'
import mongoose from 'mongoose'

import { env } from './env.js'

if (env.DNS_SERVERS.length > 0) {
  dns.setServers(env.DNS_SERVERS)
}

mongoose.set('sanitizeFilter', true)

let connectionPromise

export async function connectDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.MONGO_URI, {
      autoIndex: env.NODE_ENV !== 'production',
    })
  }

  const connection = await connectionPromise
  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`)

  return connection
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
