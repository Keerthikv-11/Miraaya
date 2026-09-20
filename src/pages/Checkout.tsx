import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>(
    'Razorpay'
  );

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load Razorpay Checkout
  useEffect(() => {
    const script = document.createElement('script');

    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Free shipping for orders of ₹2000 or more
  const shipping = cartTotal >= 2000 ? 0 : 150;

  const discountAmount = appliedCoupon?.discountAmount || 0;

  const total = Math.max(
    0,
    cartTotal + shipping - discountAmount
  );

  const inputClass =
    'w-full px-4 py-3 bg-white border border-brand-200 focus:outline-none focus:border-brand-900 text-sm rounded-sm transition-colors';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // APPLY COUPON
  // ============================================================

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();

    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setCouponLoading(true);

      const response = await fetch(
        'http://localhost:5000/api/coupons/apply',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            orderAmount: cartTotal,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Invalid coupon'
        );
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
      });

      setCouponCode(data.coupon.code);

      toast.success(
        `Coupon applied! You saved ₹${data.discountAmount.toLocaleString()}`
      );
    } catch (error) {
      setAppliedCoupon(null);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to apply coupon'
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // ============================================================
  // REMOVE COUPON
  // ============================================================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');

    toast.success('Coupon removed');
  };

  // ============================================================
  // CHECKOUT
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      toast.error('Please login before placing your order');
      navigate('/login');
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      toast.error('Please login again');
      navigate('/login');
      return;
    }

    const userId = user?.id || user?._id;

    if (!userId) {
      toast.error(
        'User information is missing. Please login again.'
      );
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const fullAddress = formData.apartment
        ? `${formData.address}, ${formData.apartment}`
        : formData.address;

      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: fullAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      // ========================================================
      // CASH ON DELIVERY
      // ========================================================

      if (paymentMethod === 'COD') {
        const response = await fetch(
          `http://localhost:5000/api/orders/${userId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              shippingAddress,
              couponCode: appliedCoupon?.code || null,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to place order'
          );
        }

        await clearCart();

        toast.success('Order placed successfully!');

        navigate('/order-success', {
          state: {
            order: data.order,
          },
        });

        return;
      }

      // ========================================================
      // RAZORPAY ONLINE PAYMENT
      // ========================================================

      if (!window.Razorpay) {
        throw new Error(
          'Payment system is still loading. Please try again.'
        );
      }

      // Create Razorpay payment order on backend
      const paymentOrderResponse = await fetch(
        `http://localhost:5000/api/orders/${userId}/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shippingAddress,
            couponCode: appliedCoupon?.code || null,
          }),
        }
      );

      const paymentOrderData =
        await paymentOrderResponse.json();

      if (!paymentOrderResponse.ok) {
        throw new Error(
          paymentOrderData.message ||
          'Failed to create payment order'
        );
      }

      // ========================================================
      // RAZORPAY CHECKOUT OPTIONS
      // ========================================================

      const options = {
        key: paymentOrderData.keyId,

        amount: paymentOrderData.amount,

        currency: paymentOrderData.currency,

        name: 'Miraaya',

        description: 'Miraaya Fashion Order',

        order_id: paymentOrderData.razorpayOrderId,

        prefill: {
          name: shippingAddress.name,
          email: formData.email,
          contact: formData.phone,
        },

        notes: {
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
        },

        theme: {
          color: '#6b4f3a',
        },

        handler: async function (response: any) {
          try {
            toast.loading('Verifying payment...', {
              id: 'payment-verification',
            });

            // Verify payment on our backend
            const verifyResponse = await fetch(
              `http://localhost:5000/api/orders/${userId}/payment/verify`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  shippingAddress,

                  couponCode:
                    appliedCoupon?.code || null,
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message ||
                'Payment verification failed'
              );
            }

            toast.success(
              'Payment successful! Order placed.',
              {
                id: 'payment-verification',
              }
            );

            await clearCart();

            navigate('/order-success', {
              state: {
                order: verifyData.order,
              },
            });
          } catch (error) {
            console.error(
              'Payment verification error:',
              error
            );

            toast.error(
              error instanceof Error
                ? error.message
                : 'Payment verification failed',
              {
                id: 'payment-verification',
              }
            );

            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            setIsProcessing(false);

            toast.error(
              'Payment cancelled. Your order was not placed.'
            );
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        'payment.failed',
        function (response: any) {
          console.error(
            'Razorpay payment failed:',
            response.error
          );

          toast.error(
            response.error?.description ||
            'Payment failed. Please try again.'
          );

          setIsProcessing(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        'Checkout error:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );

      setIsProcessing(false);
    }
  };

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

        {/* ======================================================
            CHECKOUT FORM
        ====================================================== */}

        <div className="lg:w-3/5">

          <h1 className="font-serif text-3xl mb-8">
            Checkout
          </h1>

          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-12"
          >

            {/* ==================================================
                CONTACT INFORMATION
            ================================================== */}

            <section>
              <h2 className="font-medium uppercase tracking-widest text-sm mb-6 pb-2 border-b border-brand-100">
                1. Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  required
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClass}
                />

                <input
                  required
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass}
                />

                <input
                  required
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClass} md:col-span-2`}
                />

                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${inputClass} md:col-span-2`}
                />

              </div>
            </section>


            {/* ==================================================
                DELIVERY ADDRESS
            ================================================== */}

            <section>
              <h2 className="font-medium uppercase tracking-widest text-sm mb-6 pb-2 border-b border-brand-100">
                2. Delivery Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  required
                  name="address"
                  type="text"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${inputClass} md:col-span-2`}
                />

                <input
                  name="apartment"
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={formData.apartment}
                  onChange={handleChange}
                  className={`${inputClass} md:col-span-2`}
                />

                <input
                  required
                  name="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                />

                <select
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">State</option>

                  <option value="Andhra Pradesh">
                    Andhra Pradesh
                  </option>

                  <option value="Assam">
                    Assam
                  </option>

                  <option value="Bihar">
                    Bihar
                  </option>

                  <option value="Chhattisgarh">
                    Chhattisgarh
                  </option>

                  <option value="Delhi">
                    Delhi
                  </option>

                  <option value="Goa">
                    Goa
                  </option>

                  <option value="Gujarat">
                    Gujarat
                  </option>

                  <option value="Haryana">
                    Haryana
                  </option>

                  <option value="Himachal Pradesh">
                    Himachal Pradesh
                  </option>

                  <option value="Jharkhand">
                    Jharkhand
                  </option>

                  <option value="Karnataka">
                    Karnataka
                  </option>

                  <option value="Kerala">
                    Kerala
                  </option>

                  <option value="Madhya Pradesh">
                    Madhya Pradesh
                  </option>

                  <option value="Maharashtra">
                    Maharashtra
                  </option>

                  <option value="Odisha">
                    Odisha
                  </option>

                  <option value="Punjab">
                    Punjab
                  </option>

                  <option value="Rajasthan">
                    Rajasthan
                  </option>

                  <option value="Tamil Nadu">
                    Tamil Nadu
                  </option>

                  <option value="Telangana">
                    Telangana
                  </option>

                  <option value="Uttar Pradesh">
                    Uttar Pradesh
                  </option>

                  <option value="Uttarakhand">
                    Uttarakhand
                  </option>

                  <option value="West Bengal">
                    West Bengal
                  </option>
                </select>

                <input
                  required
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  placeholder="PIN Code"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={inputClass}
                />

              </div>
            </section>


            {/* ==================================================
                PAYMENT
            ================================================== */}

            <section>

              <h2 className="font-medium uppercase tracking-widest text-sm mb-6 pb-2 border-b border-brand-100">
                3. Payment Details
              </h2>

              <div className="space-y-4">

                {/* Razorpay */}

                <label
                  className={`flex items-center justify-between p-5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'Razorpay'
                      ? 'border-brand-900 bg-brand-50'
                      : 'border-brand-200 bg-white'
                    }`}
                >

                  <div className="flex items-center gap-4">

                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={
                        paymentMethod === 'Razorpay'
                      }
                      onChange={() =>
                        setPaymentMethod('Razorpay')
                      }
                      className="text-brand-900 focus:ring-brand-900"
                    />

                    <div>

                      <p className="font-medium text-brand-900">
                        Online Payment
                      </p>

                      <p className="text-xs text-brand-600 mt-1">
                        Pay securely using UPI, Cards, Net Banking or Wallets
                      </p>

                    </div>

                  </div>

                  <span className="text-xs font-medium text-brand-900">
                    RAZORPAY
                  </span>

                </label>


                {/* COD */}

                <label
                  className={`flex items-center p-5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'COD'
                      ? 'border-brand-900 bg-brand-50'
                      : 'border-brand-200 bg-white'
                    }`}
                >

                  <div className="flex items-center gap-4">

                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={
                        paymentMethod === 'COD'
                      }
                      onChange={() =>
                        setPaymentMethod('COD')
                      }
                      className="text-brand-900 focus:ring-brand-900"
                    />

                    <div>

                      <p className="font-medium text-brand-900">
                        Cash on Delivery
                      </p>

                      <p className="text-xs text-brand-600 mt-1">
                        Pay when your order is delivered
                      </p>

                    </div>

                  </div>

                </label>

              </div>

            </section>

          </form>
        </div>


        {/* ======================================================
            ORDER SUMMARY
        ====================================================== */}

        <div className="lg:w-2/5">

          <div className="bg-brand-50 p-8 rounded-sm sticky top-32">

            <h3 className="font-serif text-2xl mb-6">
              Order Summary
            </h3>


            {/* Cart Items */}

            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">

              {cart.map((item) => (

                <div
                  key={item.product.id}
                  className="flex gap-4 items-center"
                >

                  <div className="relative w-16 aspect-[3/4] rounded-sm overflow-hidden shrink-0">

                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />

                    <span className="absolute -top-2 -right-2 bg-brand-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>

                  </div>


                  <div className="flex-grow">

                    <h4 className="font-medium text-sm text-brand-900 leading-tight mb-1">
                      {item.product.name}
                    </h4>

                    {item.size && (
                      <p className="text-xs text-brand-600">
                        Size: {item.size}
                      </p>
                    )}

                  </div>


                  <div className="font-medium text-sm">
                    ₹
                    {(
                      item.product.price *
                      item.quantity
                    ).toLocaleString()}
                  </div>

                </div>

              ))}

            </div>


            {/* ==================================================
                COUPON
            ================================================== */}

            <div className="border-t border-brand-200 pt-6 mb-6">

              <label className="block text-sm font-medium text-brand-900 mb-3">
                Have a coupon?
              </label>

              {!appliedCoupon ? (

                <div className="flex gap-2">

                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(
                        e.target.value.toUpperCase()
                      )
                    }
                    className={`${inputClass} flex-1`}
                    disabled={couponLoading}
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-5 py-3 bg-brand-900 text-white text-sm rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {couponLoading
                      ? 'Applying...'
                      : 'Apply'}
                  </button>

                </div>

              ) : (

                <div className="flex items-center justify-between bg-white border border-brand-200 px-4 py-3 rounded-sm">

                  <div>

                    <p className="text-sm font-medium text-brand-900">
                      {appliedCoupon.code}
                    </p>

                    <p className="text-xs text-brand-600">
                      ₹
                      {appliedCoupon.discountAmount.toLocaleString()}
                      {' '}discount
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>

                </div>

              )}

            </div>


            {/* ==================================================
                PRICE SUMMARY
            ================================================== */}

            <div className="space-y-4 text-brand-700 mb-6 pt-6 border-t border-brand-200">

              <div className="flex justify-between">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹{cartTotal.toLocaleString()}
                </span>

              </div>


              <div className="flex justify-between">

                <span>
                  Shipping
                </span>

                <span>
                  {shipping === 0
                    ? 'Free'
                    : `₹${shipping}`}
                </span>

              </div>


              {discountAmount > 0 && (

                <div className="flex justify-between text-green-700">

                  <span>
                    Discount
                  </span>

                  <span>
                    -₹
                    {discountAmount.toLocaleString()}
                  </span>

                </div>

              )}

            </div>


            {/* Total */}

            <div className="border-t border-brand-200 pt-6 mb-8">

              <div className="flex justify-between items-end">

                <span className="font-serif text-xl text-brand-900">
                  Total
                </span>

                <span className="font-medium text-2xl text-brand-900">
                  ₹{total.toLocaleString()}
                </span>

              </div>

            </div>


            {/* Submit */}

            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              fullWidth
              disabled={isProcessing}
            >
              {isProcessing
                ? paymentMethod === 'Razorpay'
                  ? 'Opening Payment...'
                  : 'Placing Order...'
                : paymentMethod === 'Razorpay'
                  ? `Pay ₹${total.toLocaleString()}`
                  : `Place Order (₹${total.toLocaleString()})`}
            </Button>

          </div>
        </div>

      </div>
    </div>
  );
};