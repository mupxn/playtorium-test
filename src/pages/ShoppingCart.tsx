import { useState, useEffect } from "react"
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Card,
    CardContent,
    CardMedia,
    Paper,
    Divider,
    Alert,
} from "@mui/material"
import Grid from '@mui/material/Grid2';
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import tops from "../assets/tops.jpg"
import bottoms from "../assets/bottoms.jpg"
import sandals from "../assets/sandals.jpg"
import sneakers from "../assets/sneakers.jpg"
import toteBag from "../assets/tote bag.jpg"
import backpack from "../assets/backpack.jpg"
import watches from "../assets/watches.jpg"
import jewellery from "../assets/jewellery.jpg"
import axios from "axios"

interface Product {
    id: number
    name: string
    price: number
    category: string
    image: string
}

interface PromotionData {
    id: number,
    name: string;
    campaigns: string;
    categories: string;
    Amount?: number;
    Percentage?: number;
    Category?: string;
    Every?: number;
    Discount?: number;
}

const Points = 79

const sampleProducts: Product[] = [
    { id: 1, name: "Tops", price: 300, category: "Clothing", image: tops },
    { id: 2, name: "Bottoms", price: 350, category: "Clothing", image: bottoms },
    { id: 3, name: "Sandals", price: 900, category: "Footwear", image: sandals },
    { id: 4, name: "Sneakers", price: 2000, category: "Footwear", image: sneakers },
    { id: 5, name: "Tote bag", price: 750, category: "Bags", image: toteBag },
    { id: 6, name: "Backpack", price: 1000, category: "Bags", image: backpack },
    { id: 7, name: "Watches", price: 800, category: "Accessories", image: watches },
    { id: 8, name: "Jewelry", price: 150, category: "Accessories", image: jewellery },
]

const ShoppingCart = () => {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
    const [selectedPromotions, setSelectedPromotions] = useState<PromotionData[]>([])
    const [promotionData, setPromotionData] = useState<PromotionData[]>([])
    const [price, setPrice] = useState<number | null>(null)
    const [discountPrice, setDiscountPrice] = useState<number | null>(null)

    const calculateTotal = () => {
        return selectedProducts.reduce((sum, product) => sum + product.price, 0)
    }

    const isDisabled = (promotion: PromotionData): boolean => {
        if (selectedPromotions.find(p => p.categories === promotion.categories)?.categories === promotion.categories &&
            selectedPromotions.find(p => p.categories === promotion.categories)?.campaigns !== promotion.campaigns) {
            return true
        }
        return false
    }

    const handleProductSelect = (product: Product, isSelected: boolean) => {
        if (isSelected) {
            setSelectedProducts((prev) => [...prev, product])
        } else {
            setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))
        }
    }

    const handlePromotionSelect = (promotion: PromotionData, isSelected: boolean) => {
        if (isSelected) {
            setSelectedPromotions((prev) => [...prev, promotion])
        } else {
            setSelectedPromotions((prev) => prev.filter((p) => p.id !== promotion.id))
        }
    }

    const dataCampaigns = async () => {
        try {
            const response = await axios.get('http://localhost:5000/discountData')
            setPromotionData(response.data)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        dataCampaigns()
    }, [])

    useEffect(() => {
        if (selectedProducts.length > 0 && selectedPromotions.length > 0) {
            let discountCoupon = 0
            let discountOnTop = 0
            let discountSpecialcampaigns = 0
            const total = calculateTotal()
            selectedPromotions.forEach((p) => {
                if (p.categories === 'Coupon') {
                    if (p.campaigns === 'Fixed amount') {
                        discountCoupon = (p.Amount as number)
                    } else if (p.campaigns === 'Percentage discount') {
                        discountCoupon = total * (p.Percentage as number) / 100
                    }
                } else if (p.categories === 'On Top') {
                    if (p.campaigns === 'Percentage discount by item category') {
                        const item = selectedProducts.filter(product => product.category === p.Category)
                        discountOnTop = item.reduce((sum, product) => sum + product.price, 0) * (p.Amount as number) / 100
                    } else if (p.campaigns === 'Discount by points') {
                        discountOnTop = Points * (p.Percentage as number / 100)
                    }
                } else if (p.categories === 'Special campaigns') {
                    discountSpecialcampaigns = Math.floor(total / (p.Every as number)) * (p.Discount as number)
                }
            })
            const discount = discountCoupon + discountOnTop + discountSpecialcampaigns
            setPrice(total - discount)
            setDiscountPrice(discount)
        }
    }, [selectedProducts, selectedPromotions])

    useEffect(() => {
        setSelectedPromotions([]);
        setPrice(null)
        setDiscountPrice(null)
    }, [selectedProducts]);

    useEffect(() => {
        if( selectedPromotions.length === 0) {
            setPrice(null)
            setDiscountPrice(null)
        }
    }, [selectedPromotions]);

    return (
        <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: "50px" }}>
            <Typography variant="h4" gutterBottom>
                Cart
            </Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Product list
                        </Typography>
                        {sampleProducts.map((product) => (
                            <Card key={product.id} sx={{ display: "flex", mb: 2, position: "relative" }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 100, height: 100, objectFit: "contain" }}
                                    image={product.image}
                                    alt={product.name}
                                />
                                <CardContent sx={{ flex: "1 0 auto", display: "flex", alignItems: "center" }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography component="div" variant="h6">
                                            {product.name}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary" component="div">
                                            Category: {product.category}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary" component="div">
                                            ฿{product.price.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedProducts.some((p) => p.id === product.id)}
                                                onChange={(e) => handleProductSelect(product, e.target.checked)}
                                            />
                                        }
                                        label="เลือก"
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h6" gutterBottom>
                                สรุปรายการ
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Points: {Points}
                            </Typography>
                        </Box>
                        {selectedProducts.length === 0 ? (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                กรุณาเลือกสินค้าอย่างน้อย 1 รายการ
                            </Alert>
                        ) : (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body1">จำนวนสินค้าที่เลือก: {selectedProducts.length} รายการ</Typography>
                                    <Typography variant="body1">ราคารวม: ฿{calculateTotal().toLocaleString()}</Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <LocalOfferIcon sx={{ mr: 1 }} /> เลือกโปรโมชัน
                                    </Typography>

                                    {promotionData.map((promotion) => {
                                        return (
                                            <Box
                                                key={promotion.id}
                                                sx={{
                                                    mb: 1,
                                                    p: 1,
                                                    border: "1px solid #e0e0e0",
                                                    borderRadius: 1,
                                                    backgroundColor: "transparent",
                                                }}
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={selectedPromotions.some((p) => p.id == promotion.id)}
                                                            onChange={(e) => handlePromotionSelect(promotion, e.target.checked)}
                                                            disabled={isDisabled(promotion)}
                                                        />
                                                    }

                                                    label={
                                                        <Box>
                                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                <Typography variant="subtitle1">{promotion.name}</Typography>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Category : {promotion.categories}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Campaigns : {promotion.campaigns}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </Box>
                                        )
                                    })}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box>
                                    <Typography variant="body1">ราคารวม: ฿{calculateTotal().toLocaleString()}</Typography>
                                    <Typography variant="body1" color="success.main">
                                        ส่วนลด: ฿{discountPrice ? discountPrice : 0}
                                    </Typography>
                                    <Typography variant="h6" sx={{ mt: 1 }}>
                                        ราคาสุทธิ: ฿{price ? price : 0}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ShoppingCart
