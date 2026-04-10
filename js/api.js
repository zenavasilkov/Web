const API_BASE_URL = 'http://localhost:3000';

const API = {
    async getPrograms(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/programs${queryString ? '?' + queryString : ''}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const programs = await response.json();
            const totalCount = response.headers.get('X-Total-Count');

            return {
                programs,
                totalCount: parseInt(totalCount, 10) || 0
            };
        } catch (error) {
            console.error('Ошибка загрузки программ:', error);
            throw error;
        }
    },

    async getProgramById(id) {
        const response = await fetch(`${API_BASE_URL}/programs/${id}`);
        return response.json();
    },

    async getFavorites() {
        const response = await fetch(`${API_BASE_URL}/favorites`);
        return response.json();
    },

    async addToFavorite(data) {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async removeFromFavorite(id) {
        const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
            method: 'DELETE'
        });
        return response;
    },

    async getCart() {
        const response = await fetch(`${API_BASE_URL}/cart`);
        return response.json();
    },

    async addToCart(data) {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updateCartItem(id, data) {
        const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async removeFromCart(id) {
        const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
            method: 'DELETE'
        });
        return response;
    },

    async clearCart() {
        const cart = await this.getCart();
        for (const item of cart) {
            await this.removeFromCart(item.id);
        }
    }
};
