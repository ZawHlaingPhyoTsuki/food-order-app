import { Elysia, t } from 'elysia'
import { MenuItemService } from './service'
import { MenuItemModel } from './model'
import { ownerPlugin } from '@/plugins/owner'

export const menuItems = new Elysia({
  prefix: '/:organizationId/menu',
  tags: ['menu-items'],
})
  .use(ownerPlugin)
  // Get all items (optionally filter by category)
  .get('/', async ({ params, query }) => {
    return await MenuItemService.getAll(
      params.organizationId,
      query.categoryId
    )
  }, {
    owner: true,
    query: t.Object({
      categoryId: t.Optional(t.String()),
    }),
  })
  
  // Search items
  .get('/search', async ({ params, query }) => {
    return await MenuItemService.search(params.organizationId, query.q)
  }, {
    query: t.Object({
      q: t.String({ minLength: 1 }),
    }),
  })
  
  // Get single item
  .get('/:id', async ({ params }) => {
    return await MenuItemService.getById(params.id, params.organizationId)
  }, {
    params: t.Object({
      organizationId: t.String(),
      id: t.String(),
    }),
  })
  
  // Create item
  .post('/', async ({ params, body }) => {
    return await MenuItemService.create(params.organizationId, body)
  }, {
    body: t.Composite([
      MenuItemModel.createBody,
      t.Object({
        categoryId: t.String(),
      }),
    ]),
    response: {
      200: MenuItemModel.itemResponse,
    },
  })
  
  // Update item
  .patch('/:id', async ({ params, body }) => {
    return await MenuItemService.update(
      params.id,
      params.organizationId,
      body
    )
  }, {
    params: t.Object({
      organizationId: t.String(),
      id: t.String(),
    }),
    body: MenuItemModel.updateBody,
  })
  
  // Delete item
  .delete('/:id', async ({ params }) => {
    return await MenuItemService.delete(params.id, params.organizationId)
  }, {
    params: t.Object({
      organizationId: t.String(),
      id: t.String(),
    }),
    response: {
      200: MenuItemModel.successResponse,
    },
  })
  
  // Toggle availability
  .patch('/:id/toggle', async ({ params }) => {
    return await MenuItemService.toggleAvailability(
      params.id,
      params.organizationId
    )
  }, {
    params: t.Object({
      organizationId: t.String(),
      id: t.String(),
    }),
  })
  
  // Bulk update availability
  .post('/bulk-availability', async ({ params, body }) => {
    return await MenuItemService.bulkUpdateAvailability(
      params.organizationId,
      body.itemIds,
      body.isAvailable
    )
  }, {
    body: MenuItemModel.bulkAvailabilityBody,
    response: {
      200: MenuItemModel.successResponse,
    },
  })
  
  // Reorder items within category
  .post('/reorder', async ({ params, body }) => {
    return await MenuItemService.reorder(
      params.organizationId,
      body.categoryId,
      body.itemIds
    )
  }, {
    body: t.Object({
      categoryId: t.String(),
      itemIds: t.Array(t.String()),
    }),
    response: {
      200: MenuItemModel.successResponse,
    },
  })