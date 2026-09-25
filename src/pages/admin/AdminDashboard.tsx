import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../api';
import {
    Plus,
    Trash2,
    Edit,
    Package,
    LogOut,
    ShoppingBag,
    Users,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Search,
    CreditCard,
    IndianRupee,
    Clock,
    Image,
} from 'lucide-react';

interface AdminBanner {
    _id: string;
    title: string;
    subtitle?: string;
    image: string;
    link?: string;
    isActive: boolean;
    createdAt?: string;
}

interface BannerForm {
    title: string;
    subtitle: string;
    image: string;
    link: string;
    isActive: boolean;
}

const emptyBannerForm: BannerForm = {
    title: '',
    subtitle: '',
    image: '',
    link: '/sarees',
    isActive: true,
};



interface AdminProduct {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    stock: number;
    isAvailable: boolean;
    createdAt?: string;
}

type OrderStatus =
    | 'Pending'
    | 'Confirmed'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled';

type PaymentMethod = 'COD' | 'Online';

type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

interface AdminOrder {
    _id: string;
    orderNumber?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;

    items: Array<{
        product?: AdminProduct;
        productId?: string;
        name: string;
        quantity: number;
        price: number;
        image?: string;
    }>;

    totalAmount: number;

    shippingAddress?: {
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        phone?: string;
    };

    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    status: OrderStatus;

    createdAt?: string;
    updatedAt?: string;
}

interface AdminCustomer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    totalOrders?: number;
    totalSpent?: number;
    createdAt?: string;
}

type ActiveTab = 'products' | 'orders' | 'customers' | 'banners';

type OrderFilter =
    | 'All'
    | OrderStatus;

type PaymentFilter =
    | 'All'
    | PaymentMethod
    | PaymentStatus;

interface ProductForm {
    name: string;
    description: string;
    price: string;
    category: string;
    image: string;
    stock: string;
    isAvailable: boolean;
}

const emptyProductForm: ProductForm = {
    name: '',
    description: '',
    price: '',
    category: 'Saree',
    image: '',
    stock: '0',
    isAvailable: true,
};

/*
 * IMPORTANT:
 * Some backend errors return HTML instead of JSON.
 *
 * For example:
 * <!DOCTYPE html>
 *
 * If we directly call response.json(), the browser throws:
 * Unexpected token '<'
 *
 * This helper safely reads the response first and gives us a
 * useful error instead.
 */
const readResponse = async (response: Response) => {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        const preview = text
            .replace(/\s+/g, ' ')
            .slice(0, 150);

        throw new Error(
            `Server returned a non-JSON response (${response.status}) from ${response.url}. ` +
            `Please check that the backend route exists and the server is running. ` +
            `Response: ${preview}`
        );
    }
};

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] =
        useState<ActiveTab>('products');

    const [products, setProducts] =
        useState<AdminProduct[]>([]);

    const [orders, setOrders] =
        useState<AdminOrder[]>([]);

    const [customers, setCustomers] =
        useState<AdminCustomer[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [updatingOrderId, setUpdatingOrderId] =
        useState<string | null>(null);

    const [deletingOrderId, setDeletingOrderId] =
        useState<string | null>(null);

    const [editingProductId, setEditingProductId] =
        useState<string | null>(null);

    const [showProductForm, setShowProductForm] =
        useState(false);

    const [productForm, setProductForm] =
        useState<ProductForm>(emptyProductForm);

    const [searchTerm, setSearchTerm] =
        useState('');

    const [orderFilter, setOrderFilter] =
        useState<OrderFilter>('All');

    const [paymentFilter, setPaymentFilter] =
        useState<PaymentFilter>('All');

    const [selectedOrder, setSelectedOrder] =
        useState<AdminOrder | null>(null);

    const [deletingProductId, setDeletingProductId] =
        useState<string | null>(null);

    const [savingProduct, setSavingProduct] =
        useState(false);

    const [togglingProductId, setTogglingProductId] =
        useState<string | null>(null);

    const [banners, setBanners] =
        useState<AdminBanner[]>([]);

    const [selectedCategoryFilter, setSelectedCategoryFilter] =
        useState<string>('All');

    const [showBannerForm, setShowBannerForm] =
        useState(false);

    const [bannerForm, setBannerForm] =
        useState<BannerForm>(emptyBannerForm);

    const [savingBanner, setSavingBanner] =
        useState(false);

    /*
     * Check whether admin is logged in.
     */
    useEffect(() => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            navigate('/admin-login');
            return;
        }

        const loadDashboard = async () => {
            setLoading(true);

            try {
                await Promise.all([
                    fetchProducts(),
                    fetchOrders(),
                    fetchCustomers(),
                    fetchBanners(),
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);

    /*
     * -----------------------------
     * FETCH PRODUCTS
     * -----------------------------
     */
    const fetchProducts = async () => {
        try {
            const response = await fetch(
                `${API_URL}/admin/products`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'adminToken'
                        )}`,
                    },
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to fetch products'
                );
            }

            const productList = Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : [];

            setProducts(productList);
        } catch (error) {
            console.error('Products error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch products';

            toast.error(message);
        }
    };

    /*
     * -----------------------------
     * FETCH ORDERS
     * -----------------------------
     */
    const fetchOrders = async () => {
        try {
            const response = await fetch(
                `${API_URL}/admin/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'adminToken'
                        )}`,
                    },
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to fetch orders'
                );
            }

            const orderList = Array.isArray(data)
                ? data
                : Array.isArray(data.orders)
                    ? data.orders
                    : [];

            setOrders(orderList);
        } catch (error) {
            console.error('Orders error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch orders';

            toast.error(message);
        }
    };

    /*
     * -----------------------------
     * FETCH CUSTOMERS
     * -----------------------------
     */
    const fetchCustomers = async () => {
        try {
            const response = await fetch(
                `${API_URL}/admin/customers`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'adminToken'
                        )}`,
                    },
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to fetch customers'
                );
            }

            const customerList = Array.isArray(data)
                ? data
                : Array.isArray(data.customers)
                    ? data.customers
                    : [];

            setCustomers(customerList);
        } catch (error) {
            console.error('Customers error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch customers';

            toast.error(message);
        }
    };

    /*
     * -----------------------------
     * REFRESH EVERYTHING
     * -----------------------------
     */
    const refreshDashboard = async () => {
        setRefreshing(true);

        try {
            await Promise.all([
                fetchProducts(),
                fetchOrders(),
                fetchCustomers(),
                fetchBanners(),
            ]);

            toast.success('Dashboard refreshed');
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    /*
     * -----------------------------
     * FETCH BANNERS
     * -----------------------------
     */
    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_URL}/banners/admin/all`);
            if (response.ok) {
                const data = await response.json();
                setBanners(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching admin banners:', error);
        }
    };

    /*
     * -----------------------------
     * BANNER ACTIONS & HANDLERS
     * -----------------------------
     */
    const openAddBanner = () => {
        setBannerForm(emptyBannerForm);
        setShowBannerForm(true);
    };

    const handleSaveBanner = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!bannerForm.title.trim() || !bannerForm.image.trim()) {
            toast.error('Please enter a banner title and image URL');
            return;
        }

        try {
            setSavingBanner(true);
            const response = await fetch(`${API_URL}/banners/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bannerForm),
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save banner');
            }

            toast.success('Billboard banner added successfully');
            setShowBannerForm(false);
            setBannerForm(emptyBannerForm);
            await fetchBanners();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save banner');
        } finally {
            setSavingBanner(false);
        }
    };

    const toggleBannerActive = async (id: string, isActive: boolean) => {
        try {
            const response = await fetch(`${API_URL}/banners/admin/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive }),
            });

            if (!response.ok) {
                throw new Error('Failed to update banner status');
            }

            toast.success(isActive ? 'Banner activated' : 'Banner disabled');
            await fetchBanners();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update banner');
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this advertisement banner?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/banners/admin/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete banner');
            }

            toast.success('Banner deleted successfully');
            await fetchBanners();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete banner');
        }
    };

    const renderBannerForm = () => {
        if (!showBannerForm) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Add Billboard / Advertisement</h2>
                            <p className="mt-1 text-sm text-gray-500">Feature a new promotional banner on the customer homepage.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowBannerForm(false)}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveBanner} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Banner Title *</label>
                            <input
                                required
                                type="text"
                                value={bannerForm.title}
                                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                                placeholder="e.g. Royal Bridal Saree Fest"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Subtitle / Offer Description</label>
                            <input
                                type="text"
                                value={bannerForm.subtitle}
                                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                                placeholder="e.g. Up to 40% off on handcrafted silk sarees & Kundan sets"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Image URL *</label>
                            <input
                                required
                                type="text"
                                value={bannerForm.image}
                                onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                            />
                            {bannerForm.image && (
                                <div className="mt-3">
                                    <img
                                        src={bannerForm.image}
                                        alt="Banner Preview"
                                        className="h-32 w-full rounded-xl object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Target Link URL</label>
                            <select
                                value={bannerForm.link}
                                onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900"
                            >
                                <option value="/sarees">Sarees Collection (/sarees)</option>
                                <option value="/jewellery">Jewellery Collection (/jewellery)</option>
                                <option value="/dresses">Dresses Collection (/dresses)</option>
                                <option value="/">Homepage (/)</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowBannerForm(false)}
                                className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={savingBanner}
                                className="rounded-xl bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {savingBanner ? 'Saving...' : 'Add Billboard Banner'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderBanners = () => {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Billboard & Advertisements</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage hero carousel banners and promotional advertisements displayed on the main customer page.</p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddBanner}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
                    >
                        <Plus size={18} />
                        Add Advertisement
                    </button>
                </div>

                {banners.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                        <Image size={45} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800">No Custom Advertisements</h3>
                        <p className="mt-1 text-sm text-gray-500">Add banner images to customize the homepage hero billboard.</p>
                        <button
                            type="button"
                            onClick={openAddBanner}
                            className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Add Advertisement Banner
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {banners.map((banner) => (
                            <div key={banner._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
                                <div className="relative h-48 w-full bg-gray-100">
                                    <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {banner.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                                        {banner.subtitle && <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>}
                                        {banner.link && (
                                            <p className="text-xs text-gray-400 mt-2 font-mono">
                                                Link: {banner.link}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleBannerActive(banner._id, !banner.isActive)}
                                            className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition ${banner.isActive ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'}`}
                                        >
                                            {banner.isActive ? 'Deactivate' : 'Activate Banner'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteBanner(banner._id)}
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                            title="Delete Banner"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    /*
     * -----------------------------
     * LOGOUT
     * -----------------------------
     */
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
    };

    /*
     * -----------------------------
     * ORDER STATUS UPDATE
     * -----------------------------
     */
    const handleStatusChange = async (
        orderId: string,
        status: OrderStatus
    ) => {
        try {
            setUpdatingOrderId(orderId);

            const response = await fetch(
                `${API_URL}/admin/orders/${orderId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem(
                            'adminToken'
                        )}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to update order status'
                );
            }

            setOrders(previousOrders =>
                previousOrders.map(order =>
                    order._id === orderId
                        ? {
                            ...order,
                            status,
                        }
                        : order
                )
            );

            toast.success('Order status updated');
        } catch (error) {
            console.error('Status update error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to update order status';

            toast.error(message);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    /*
     * -----------------------------
     * DELETE ORDER
     * -----------------------------
     */
    const handleDeleteOrder = async (
        orderId: string
    ) => {
        const confirmed = window.confirm(
            'Are you sure you want to permanently delete this order?\n\nThis action cannot be undone.'
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingOrderId(orderId);

            const response = await fetch(
                `${API_URL}/admin/orders/${orderId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'adminToken'
                        )}`,
                    },
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to delete order'
                );
            }

            setOrders(previousOrders =>
                previousOrders.filter(
                    order => order._id !== orderId
                )
            );

            if (selectedOrder?._id === orderId) {
                setSelectedOrder(null);
            }

            toast.success('Order deleted successfully');

            await fetchCustomers();
        } catch (error) {
            console.error('Delete order error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to delete order';

            toast.error(message);
        } finally {
            setDeletingOrderId(null);
        }
    };

    /*
     * -----------------------------
     * OPEN ADD PRODUCT FORM
     * -----------------------------
     */
    const openAddProduct = () => {
        setEditingProductId(null);
        setProductForm(emptyProductForm);
        setShowProductForm(true);
    };

    /*
     * -----------------------------
     * OPEN EDIT PRODUCT FORM
     * -----------------------------
     */
    const openEditProduct = (
        product: AdminProduct
    ) => {
        setEditingProductId(product._id);

        setProductForm({
            name: product.name || '',
            description: product.description || '',
            price: String(product.price ?? ''),
            category: product.category || 'Saree',
            image: product.image || '',
            stock: String(product.stock ?? 0),
            isAvailable: product.isAvailable !== false,
        });

        setShowProductForm(true);
    };

    /*
     * -----------------------------
     * FORM CHANGE
     * -----------------------------
     */
    const handleProductFormChange = (
        field: keyof ProductForm,
        value: string | boolean
    ) => {
        setProductForm(previous => ({
            ...previous,
            [field]: value,
        }));
    };

    /*
     * -----------------------------
     * SAVE PRODUCT
     * -----------------------------
     */
    const handleSaveProduct = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        const price = Number(productForm.price);
        const stock = Number(productForm.stock);

        if (!productForm.name.trim()) {
            toast.error('Please enter product name');
            return;
        }

        if (
            productForm.price === '' ||
            Number.isNaN(price) ||
            price < 0
        ) {
            toast.error('Please enter a valid price');
            return;
        }

        /*
         * IMPORTANT:
         * Stock 0 is allowed because 0 means OUT OF STOCK.
         */
        if (
            productForm.stock === '' ||
            Number.isNaN(stock) ||
            stock < 0
        ) {
            toast.error('Please enter a valid stock quantity');
            return;
        }

        try {
            setSavingProduct(true);

            const payload = {
                name: productForm.name.trim(),
                description: productForm.description.trim(),
                price,
                category: productForm.category,
                image: productForm.image.trim(),
                stock,
                isAvailable: productForm.isAvailable,
            };

            const isEditing = Boolean(editingProductId);

            const url = isEditing
                ? `${API_URL}/admin/products/${editingProductId}`
                : `${API_URL}/admin/products`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem(
                        'adminToken'
                    )}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    `Failed to ${isEditing ? 'update' : 'add'} product`
                );
            }

            toast.success(
                isEditing
                    ? 'Product updated successfully'
                    : 'Product added successfully'
            );

            setShowProductForm(false);
            setEditingProductId(null);
            setProductForm(emptyProductForm);

            await fetchProducts();
        } catch (error) {
            console.error('Save product error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to save product';

            toast.error(message);
        } finally {
            setSavingProduct(false);
        }
    };

    /*
     * -----------------------------
     * DELETE PRODUCT
     * -----------------------------
     */
    const handleDeleteProduct = async (
        productId: string
    ) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this product?'
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingProductId(productId);

            const response = await fetch(
                `${API_URL}/admin/products/${productId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'adminToken'
                        )}`,
                    },
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to delete product'
                );
            }

            setProducts(previousProducts =>
                previousProducts.filter(
                    product => product._id !== productId
                )
            );

            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Delete product error:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to delete product';

            toast.error(message);
        } finally {
            setDeletingProductId(null);
        }
    };

    /*
     * -----------------------------
     * TOGGLE PRODUCT AVAILABILITY
     * -----------------------------
     */
    const handleToggleAvailability = async (
        product: AdminProduct
    ) => {
        try {
            setTogglingProductId(product._id);

            const response = await fetch(
                `${API_URL}/admin/products/${product._id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem(
                            'adminToken'
                        )}`,
                    },
                    body: JSON.stringify({
                        isAvailable: !product.isAvailable,
                    }),
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Failed to update product availability'
                );
            }

            setProducts(previousProducts =>
                previousProducts.map(item =>
                    item._id === product._id
                        ? {
                            ...item,
                            isAvailable: !item.isAvailable,
                        }
                        : item
                )
            );

            toast.success(
                product.isAvailable
                    ? 'Product marked unavailable'
                    : 'Product marked available'
            );
        } catch (error) {
            console.error(
                'Availability update error:',
                error
            );

            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to update availability';

            toast.error(message);
        } finally {
            setTogglingProductId(null);
        }
    };
    /*
   * ================================
   * DASHBOARD CALCULATIONS
   * ================================
   */

    const totalProducts = products.length;

    const availableProducts = products.filter(
        (product) =>
            product.isAvailable && product.stock > 0
    ).length;

    const outOfStockProducts = products.filter(
        (product) => product.stock === 0
    ).length;

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) => order.status === 'Pending'
    ).length;



    const totalCustomers = customers.length;

    const totalRevenue = orders
        .filter((order) => order.status !== 'Cancelled')
        .reduce(
            (total, order) =>
                total + Number(order.totalAmount || 0),
            0
        );

    /*
     * ================================
     * FILTER PRODUCTS
     * ================================
     */

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            selectedCategoryFilter === 'All' ||
            product.category === selectedCategoryFilter;

        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            product.name?.toLowerCase().includes(search) ||
            product.category?.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search);

        return matchesCategory && matchesSearch;
    });

    /*
     * ================================
     * FILTER ORDERS
     * ================================
     */

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            orderFilter === 'All' ||
            order.status === orderFilter;

        const matchesPayment =
            paymentFilter === 'All' ||
            order.paymentMethod === paymentFilter ||
            order.paymentStatus === paymentFilter;

        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            order.orderNumber?.toLowerCase().includes(search) ||
            order.customerName?.toLowerCase().includes(search) ||
            order.customerEmail?.toLowerCase().includes(search);

        return (
            matchesStatus &&
            matchesPayment &&
            matchesSearch
        );
    });

    /*
     * ================================
     * FILTER CUSTOMERS
     * ================================
     */

    const filteredCustomers = customers.filter(
        (customer) => {
            const search = searchTerm.toLowerCase().trim();

            if (!search) {
                return true;
            }

            return (
                customer.name?.toLowerCase().includes(search) ||
                customer.email?.toLowerCase().includes(search) ||
                customer.phone?.toLowerCase().includes(search)
            );
        }
    );

    /*
     * ================================
     * FORMAT CURRENCY
     * ================================
     */

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    /*
     * ================================
     * FORMAT DATE
     * ================================
     */

    const formatDate = (date?: string) => {
        if (!date) {
            return 'N/A';
        }

        try {
            return new Date(date).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    };

    /*
     * ================================
     * STATUS COLOR
     * ================================
     */

    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-700';

            case 'Cancelled':
                return 'bg-red-100 text-red-700';

            case 'Shipped':
                return 'bg-blue-100 text-blue-700';

            case 'Processing':
                return 'bg-purple-100 text-purple-700';

            case 'Confirmed':
                return 'bg-indigo-100 text-indigo-700';

            case 'Pending':
            default:
                return 'bg-yellow-100 text-yellow-700';
        }
    };

    /*
     * ================================
     * PRODUCT FORM
     * ================================
     */

    const renderProductForm = () => {
        if (!showProductForm) {
            return null;
        }

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

                    {/* Form Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {editingProductId
                                    ? 'Edit Product'
                                    : 'Add New Product'}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your Miraaya product details.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowProductForm(false);
                                setEditingProductId(null);
                                setProductForm(emptyProductForm);
                            }}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    {/* Product Form */}
                    <form
                        onSubmit={handleSaveProduct}
                        className="space-y-5"
                    >

                        {/* Product Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Product Name
                            </label>

                            <input
                                type="text"
                                value={productForm.name}
                                onChange={(event) =>
                                    handleProductFormChange(
                                        'name',
                                        event.target.value
                                    )
                                }
                                placeholder="Example: Royal Blue Silk Saree"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>

                            <textarea
                                value={productForm.description}
                                onChange={(event) =>
                                    handleProductFormChange(
                                        'description',
                                        event.target.value
                                    )
                                }
                                placeholder="Enter product description..."
                                rows={4}
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                            />
                        </div>

                        {/* Price and Stock */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Price (₹)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={productForm.price}
                                    onChange={(event) =>
                                        handleProductFormChange(
                                            'price',
                                            event.target.value
                                        )
                                    }
                                    placeholder="2000"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Stock
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={productForm.stock}
                                    onChange={(event) =>
                                        handleProductFormChange(
                                            'stock',
                                            event.target.value
                                        )
                                    }
                                    placeholder="10"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Enter 0 when the product is out of stock.
                                </p>
                            </div>

                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Category
                            </label>

                            <select
                                value={productForm.category}
                                onChange={(event) =>
                                    handleProductFormChange(
                                        'category',
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900"
                            >
                                <option value="Saree">
                                    Sarees
                                </option>

                                <option value="Dress">
                                    Dresses
                                </option>

                                <option value="Jewellery">
                                    Jewellery
                                </option>
                            </select>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Product Image URL
                            </label>

                            <input
                                type="text"
                                value={productForm.image}
                                onChange={(event) =>
                                    handleProductFormChange(
                                        'image',
                                        event.target.value
                                    )
                                }
                                placeholder="https://example.com/product.jpg"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                            />

                            {/* Image Preview */}
                            {productForm.image && (
                                <div className="mt-3">
                                    <img
                                        src={productForm.image}
                                        alt="Product preview"
                                        className="h-40 w-40 rounded-xl object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Availability */}
                        <div className="rounded-xl bg-gray-50 p-4">
                            <label className="flex cursor-pointer items-center gap-3">

                                <input
                                    type="checkbox"
                                    checked={productForm.isAvailable}
                                    onChange={(event) =>
                                        handleProductFormChange(
                                            'isAvailable',
                                            event.target.checked
                                        )
                                    }
                                    className="h-5 w-5 rounded"
                                />

                                <div>
                                    <p className="font-medium text-gray-800">
                                        Product is available
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Uncheck this to hide the product from customers.
                                    </p>
                                </div>

                            </label>
                        </div>

                        {/* Form Buttons */}
                        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowProductForm(false);
                                    setEditingProductId(null);
                                    setProductForm(emptyProductForm);
                                }}
                                className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={savingProduct}
                                className="rounded-xl bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {savingProduct
                                    ? 'Saving...'
                                    : editingProductId
                                        ? 'Update Product'
                                        : 'Add Product'}
                            </button>

                        </div>

                    </form>
                </div>
            </div>
        );
    };

    /*
     * ================================
     * PRODUCTS SECTION
     * ================================
     */

    const renderProducts = () => {
        return (
            <div className="space-y-6">

                {/* Products Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Products
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage products, prices and stock.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddProduct}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
                    >
                        <Plus size={18} />
                        Add Product
                    </button>

                </div>

                {/* Search and Category Filter Dropdown */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                    <div className="relative flex-1">
                        <Search
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search products by name, description..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-gray-900"
                        />
                    </div>

                    <div className="w-full sm:w-60">
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-gray-900 cursor-pointer shadow-sm"
                        >
                            <option value="All">All Categories</option>
                            <option value="Saree">Sarees</option>
                            <option value="Jewellery">Jewellery</option>
                            <option value="Dress">Dresses</option>
                        </select>
                    </div>

                </div>

                {/* No Products */}
                {filteredProducts.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

                        <Package
                            size={45}
                            className="mx-auto mb-4 text-gray-300"
                        />

                        <h3 className="text-lg font-semibold text-gray-800">
                            No products found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Add a product to start managing your Miraaya store.
                        </p>

                        <button
                            type="button"
                            onClick={openAddProduct}
                            className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Add Product
                        </button>

                    </div>

                ) : (

                    /* Product Cards */
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {filteredProducts.map((product) => (

                            <div
                                key={product._id}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                            >

                                {/* Product Image */}
                                <div className="relative h-56 bg-gray-100">

                                    {product.image ? (

                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />

                                    ) : (

                                        <div className="flex h-full items-center justify-center">
                                            <Package
                                                size={45}
                                                className="text-gray-300"
                                            />
                                        </div>

                                    )}

                                    {/* Stock Badge */}
                                    <div className="absolute right-3 top-3">

                                        {product.stock === 0 ? (

                                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                Out of Stock
                                            </span>

                                        ) : product.isAvailable ? (

                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                Available
                                            </span>

                                        ) : (

                                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                                                Hidden
                                            </span>

                                        )}

                                    </div>
                                </div>

                                {/* Product Information */}
                                <div className="p-5">

                                    <div className="mb-2 flex items-start justify-between gap-3">

                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {product.name}
                                            </h3>

                                            <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                                                {product.category}
                                            </p>
                                        </div>

                                        <span className="whitespace-nowrap font-semibold text-gray-900">
                                            {formatCurrency(product.price)}
                                        </span>

                                    </div>

                                    {product.description && (
                                        <p className="mb-4 text-sm text-gray-500">
                                            {product.description}
                                        </p>
                                    )}

                                    {/* Stock Information */}
                                    <div className="mb-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                                        <div className="flex items-center gap-2">
                                            <Package
                                                size={17}
                                                className="text-gray-500"
                                            />

                                            <span className="text-sm text-gray-600">
                                                Stock
                                            </span>
                                        </div>

                                        <span
                                            className={
                                                product.stock === 0
                                                    ? 'font-semibold text-red-600'
                                                    : product.stock <= 5
                                                        ? 'font-semibold text-orange-600'
                                                        : 'font-semibold text-gray-900'
                                            }
                                        >
                                            {product.stock}
                                        </span>

                                    </div>

                                    {/* Product Actions */}
                                    <div className="grid grid-cols-3 gap-2">

                                        {/* Edit */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditProduct(product)
                                            }
                                            className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            <Edit size={15} />
                                            Edit
                                        </button>

                                        {/* Show / Hide */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleAvailability(product)
                                            }
                                            disabled={
                                                togglingProductId === product._id
                                            }
                                            className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            {product.isAvailable ? (
                                                <>
                                                    <XCircle size={15} />
                                                    Hide
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={15} />
                                                    Show
                                                </>
                                            )}
                                        </button>

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteProduct(product._id)
                                            }
                                            disabled={
                                                deletingProductId === product._id
                                            }
                                            className="flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            <Trash2 size={15} />
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            </div>

                        ))}

                    </div>
                )}

                {/* Product Modal */}
                {renderProductForm()}

            </div>
        );
    };  /*
   * ================================
   * ORDERS SECTION
   * ================================
   */

    const renderOrders = () => {
        return (
            <div className="space-y-6">

                {/* Orders Header */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Orders
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View and manage customer orders.
                    </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search orders..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-gray-900"
                        />
                    </div>

                    {/* Order Status */}
                    <select
                        value={orderFilter}
                        onChange={(event) =>
                            setOrderFilter(
                                event.target.value as OrderFilter
                            )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-900"
                    >
                        <option value="All">
                            All Order Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Confirmed">
                            Confirmed
                        </option>

                        <option value="Processing">
                            Processing
                        </option>

                        <option value="Shipped">
                            Shipped
                        </option>

                        <option value="Delivered">
                            Delivered
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>

                    {/* Payment */}
                    <select
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(
                                event.target.value as PaymentFilter
                            )
                        }
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-gray-900"
                    >
                        <option value="All">
                            All Payment Status
                        </option>

                        <option value="COD">
                            Cash on Delivery
                        </option>

                        <option value="Online">
                            Online Payment
                        </option>

                        <option value="Pending">
                            Payment Pending
                        </option>

                        <option value="Paid">
                            Paid
                        </option>

                        <option value="Failed">
                            Failed
                        </option>
                    </select>

                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

                        <ShoppingBag
                            size={45}
                            className="mx-auto mb-4 text-gray-300"
                        />

                        <h3 className="text-lg font-semibold text-gray-800">
                            No orders found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            There are no orders matching your filters.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {filteredOrders.map((order) => (

                            <div
                                key={order._id}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                            >

                                {/* Order Top */}
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">

                                            <h3 className="font-semibold text-gray-900">
                                                #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>

                                        </div>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                            <Clock size={15} />
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </div>

                                    <div className="text-left lg:text-right">
                                        <p className="text-xs uppercase tracking-wide text-gray-400">
                                            Total
                                        </p>

                                        <p className="text-xl font-semibold text-gray-900">
                                            {formatCurrency(order.totalAmount)}
                                        </p>
                                    </div>

                                </div>

                                {/* Customer + Payment */}
                                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 md:grid-cols-2">

                                    {/* Customer */}
                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <div className="mb-2 flex items-center gap-2">
                                            <Users
                                                size={17}
                                                className="text-gray-500"
                                            />

                                            <span className="text-sm font-semibold text-gray-800">
                                                Customer
                                            </span>
                                        </div>

                                        <p className="font-medium text-gray-900">
                                            {order.customerName || 'N/A'}
                                        </p>

                                        {order.customerEmail && (
                                            <p className="mt-1 break-all text-sm text-gray-500">
                                                {order.customerEmail}
                                            </p>
                                        )}

                                        {order.customerPhone && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {order.customerPhone}
                                            </p>
                                        )}

                                    </div>

                                    {/* Payment */}
                                    <div className="rounded-xl bg-gray-50 p-4">

                                        <div className="mb-2 flex items-center gap-2">
                                            <CreditCard
                                                size={17}
                                                className="text-gray-500"
                                            />

                                            <span className="text-sm font-semibold text-gray-800">
                                                Payment
                                            </span>
                                        </div>

                                        <p className="font-medium text-gray-900">
                                            {order.paymentMethod === 'COD'
                                                ? 'Cash on Delivery'
                                                : 'Online Payment'}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Status:{' '}
                                            <span className="font-medium">
                                                {order.paymentStatus}
                                            </span>
                                        </p>

                                    </div>

                                </div>

                                {/* Order Items */}
                                <div className="mt-5 border-t border-gray-100 pt-5">

                                    <h4 className="mb-3 text-sm font-semibold text-gray-800">
                                        Items
                                    </h4>

                                    <div className="space-y-3">

                                        {order.items?.map(
                                            (item, index) => (

                                                <div
                                                    key={`${order._id}-${index}`}
                                                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                                                >

                                                    {/* Item Image */}
                                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-200">

                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <Package
                                                                    size={20}
                                                                    className="text-gray-400"
                                                                />
                                                            </div>
                                                        )}

                                                    </div>

                                                    {/* Item Details */}
                                                    <div className="min-w-0 flex-1">

                                                        <p className="truncate font-medium text-gray-900">
                                                            {item.name}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Qty: {item.quantity}
                                                        </p>

                                                    </div>

                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            Number(item.price || 0) *
                                                            Number(item.quantity || 0)
                                                        )}
                                                    </p>

                                                </div>

                                            )
                                        )}

                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="mt-5 rounded-xl border border-gray-100 p-4">

                                        <h4 className="mb-2 text-sm font-semibold text-gray-800">
                                            Shipping Address
                                        </h4>

                                        <p className="text-sm leading-6 text-gray-600">

                                            {order.shippingAddress.name && (
                                                <>
                                                    <span className="font-medium text-gray-800">
                                                        {order.shippingAddress.name}
                                                    </span>
                                                    <br />
                                                </>
                                            )}

                                            {order.shippingAddress.address && (
                                                <>
                                                    {order.shippingAddress.address}
                                                    <br />
                                                </>
                                            )}

                                            {order.shippingAddress.city && (
                                                <>
                                                    {order.shippingAddress.city}
                                                    {order.shippingAddress.state
                                                        ? `, ${order.shippingAddress.state}`
                                                        : ''}
                                                    <br />
                                                </>
                                            )}

                                            {order.shippingAddress.pincode && (
                                                <>
                                                    PIN: {order.shippingAddress.pincode}
                                                    <br />
                                                </>
                                            )}

                                            {order.shippingAddress.phone && (
                                                <>
                                                    Phone: {order.shippingAddress.phone}
                                                </>
                                            )}

                                        </p>

                                    </div>
                                )}

                                {/* Order Actions */}
                                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                                    {/* Status */}
                                    <div className="flex items-center gap-2">

                                        <label className="text-sm font-medium text-gray-600">
                                            Update Status:
                                        </label>

                                        <select
                                            value={order.status}
                                            disabled={
                                                updatingOrderId === order._id
                                            }
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    order._id,
                                                    event.target.value as OrderStatus
                                                )
                                            }
                                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900 disabled:opacity-50"
                                        >
                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="Confirmed">
                                                Confirmed
                                            </option>

                                            <option value="Processing">
                                                Processing
                                            </option>

                                            <option value="Shipped">
                                                Shipped
                                            </option>

                                            <option value="Delivered">
                                                Delivered
                                            </option>

                                            <option value="Cancelled">
                                                Cancelled
                                            </option>
                                        </select>

                                    </div>

                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteOrder(order._id)
                                        }
                                        disabled={
                                            deletingOrderId === order._id ||
                                            updatingOrderId === order._id
                                        }
                                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />

                                        {deletingOrderId === order._id
                                            ? 'Deleting...'
                                            : 'Delete Order'}
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>
        );
    };

    /*
     * ================================
     * CUSTOMERS SECTION
     * ================================
     */

    const renderCustomers = () => {
        return (
            <div className="space-y-6">

                {/* Header */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Customers
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View customers and their order information.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">

                    <Search
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search customers..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-gray-900"
                    />

                </div>

                {/* Customer List */}
                {filteredCustomers.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

                        <Users
                            size={45}
                            className="mx-auto mb-4 text-gray-300"
                        />

                        <h3 className="text-lg font-semibold text-gray-800">
                            No customers found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Customer information will appear here after orders are placed.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[700px]">

                                <thead className="bg-gray-50">

                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Customer
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Phone
                                        </th>

                                        <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Orders
                                        </th>

                                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Total Spent
                                        </th>

                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Joined
                                        </th>
                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {filteredCustomers.map(
                                        (customer) => (

                                            <tr
                                                key={customer._id}
                                                className="hover:bg-gray-50"
                                            >

                                                <td className="px-5 py-4">

                                                    <p className="font-medium text-gray-900">
                                                        {customer.name}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {customer.email}
                                                    </p>

                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {customer.phone || 'N/A'}
                                                </td>

                                                <td className="px-5 py-4 text-center font-medium text-gray-800">
                                                    {customer.totalOrders ?? 0}
                                                </td>

                                                <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        customer.totalSpent ?? 0
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-500">
                                                    {formatDate(
                                                        customer.createdAt
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>
        );
    };

    /*
     * ================================
     * LOADING SCREEN
     * ================================
     */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">

                <div className="text-center">

                    <RefreshCw
                        size={35}
                        className="mx-auto mb-4 animate-spin text-gray-700"
                    />

                    <p className="font-medium text-gray-700">
                        Loading Miraaya Admin Dashboard...
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Please wait.
                    </p>

                </div>

            </div>
        );
    }

    /*
     * ================================
     * MAIN DASHBOARD
     * ================================
     */

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ================================
          TOP BAR
          ================================ */}

            <header className="sticky top-3  z-40 border-b border-gray-200 bg-white">

                <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                    <div>
                        <h1 className="text-xl font-semibold tracking-wide text-gray-900">
                            MIRAAYA
                        </h1>

                        <p className="text-xs text-gray-500">
                            Admin Dashboard
                        </p>
                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={refreshDashboard}
                            disabled={refreshing}
                            title="Refresh dashboard"
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={19}
                                className={
                                    refreshing
                                        ? 'animate-spin'
                                        : ''
                                }
                            />
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <LogOut size={17} />
                            <span className="hidden sm:inline">
                                Logout
                            </span>
                        </button>

                    </div>

                </div>

            </header>

            {/* ================================
          PAGE CONTENT
          ================================ */}

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* ================================
            SUMMARY CARDS
            ================================ */}

                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

                    {/* Products */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">

                        <div className="mb-4 flex items-center justify-between">

                            <div className="rounded-xl bg-gray-100 p-2.5">
                                <Package
                                    size={20}
                                    className="text-gray-700"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                Products
                            </span>

                        </div>

                        <p className="text-2xl font-semibold text-gray-900">
                            {totalProducts}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {availableProducts} available
                        </p>

                    </div>

                    {/* Orders */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">

                        <div className="mb-4 flex items-center justify-between">

                            <div className="rounded-xl bg-gray-100 p-2.5">
                                <ShoppingBag
                                    size={20}
                                    className="text-gray-700"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                Orders
                            </span>

                        </div>

                        <p className="text-2xl font-semibold text-gray-900">
                            {totalOrders}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {pendingOrders} pending
                        </p>

                    </div>

                    {/* Customers */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">

                        <div className="mb-4 flex items-center justify-between">

                            <div className="rounded-xl bg-gray-100 p-2.5">
                                <Users
                                    size={20}
                                    className="text-gray-700"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                Customers
                            </span>

                        </div>

                        <p className="text-2xl font-semibold text-gray-900">
                            {totalCustomers}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Registered customers
                        </p>

                    </div>

                    {/* Revenue */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">

                        <div className="mb-4 flex items-center justify-between">

                            <div className="rounded-xl bg-gray-100 p-2.5">
                                <IndianRupee
                                    size={20}
                                    className="text-gray-700"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                Revenue
                            </span>

                        </div>

                        <p className="text-2xl font-semibold text-gray-900">
                            {formatCurrency(totalRevenue)}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            From non-cancelled orders
                        </p>

                    </div>

                </div>

                {/* ================================
            EXTRA STOCK ALERT
            ================================ */}

                {outOfStockProducts > 0 && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                        <div className="rounded-xl bg-red-100 p-2">
                            <AlertTriangle
                                size={20}
                                className="text-red-600"
                            />
                        </div>

                        <div>
                            <p className="font-semibold text-red-800">
                                Stock Alert
                            </p>

                            <p className="text-sm text-red-700">
                                {outOfStockProducts}{' '}
                                {outOfStockProducts === 1
                                    ? 'product is'
                                    : 'products are'}{' '}
                                currently out of stock.
                            </p>
                        </div>

                    </div>
                )}

                {/* ================================
            NAVIGATION TABS
            ================================ */}

                <div className="mb-6 overflow-x-auto">

                    <div className="flex min-w-max gap-2 rounded-xl border border-gray-200 bg-white p-2">

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('products');
                                setSearchTerm('');
                            }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === 'products'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Package size={17} />
                            Products
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('orders');
                                setSearchTerm('');
                            }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === 'orders'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ShoppingBag size={17} />
                            Orders

                            {pendingOrders > 0 && (
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${activeTab === 'orders'
                                        ? 'bg-white text-gray-900'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {pendingOrders}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('customers');
                                setSearchTerm('');
                            }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === 'customers'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Users size={17} />
                            Customers
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('banners');
                                setSearchTerm('');
                            }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === 'banners'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Image size={17} />
                            Billboards & Ads
                        </button>

                    </div>

                </div>

                {/* ================================
            ACTIVE SECTION
            ================================ */}

                <div>

                    {activeTab === 'products' &&
                        renderProducts()}

                    {activeTab === 'orders' &&
                        renderOrders()}

                    {activeTab === 'customers' &&
                        renderCustomers()}

                    {activeTab === 'banners' &&
                        renderBanners()}

                </div>

            </div>

            {/* Modals */}
            {renderProductForm()}
            {renderBannerForm()}

        </div>
    );
};

export default AdminDashboard;