// import { t, type UnwrapSchema } from 'elysia'

// export const TableModel = {
//   createBody: t.Object({
//     tableNumber: t.String(),
//   }),
  
//   updateBody: t.Object({
//     tableNumber: t.Optional(t.String()),
//     status: t.Optional(t.Enum({
//       FREE: 'FREE',
//       OCCUPIED: 'OCCUPIED',
//       NEEDS_CLEANING: 'NEEDS_CLEANING',
//     })),
//   }),
  
//   createResponse: t.Object({
//     success: t.Boolean(),
//     table: t.Object({
//       id: t.String(),
//       tableNumber: t.String(),
//       tableToken: t.String(),
//       status: t.String(),
//     }),
//     qrCodeUrl: t.String(),
//   }),
// } as const

// export type TableModel = {
//   [K in keyof typeof TableModel]: UnwrapSchema<(typeof TableModel)[K]>
// }