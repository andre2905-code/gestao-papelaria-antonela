import { apiFetch } from './api'
import type { Product } from '../types/api'

export type CreateProductData = {
    title: string
    price: number
    promo_price: number | null
    sku: string
    category_id: number
    deposits: {
        id: number
        quantity: number
    }[]
}

export async function getProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/products')
}

export async function createProduct(
    product: CreateProductData
): Promise<Product> {
    return apiFetch<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(product),
    })
}

export async function deleteProduct(id: number): Promise<void> {
    await apiFetch<void>(`/products/${id}`, {
        method: 'DELETE',
    })
}