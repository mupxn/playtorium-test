import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import axios from "axios"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    SelectChangeEvent,
    FormHelperText
} from "@mui/material"

interface FormValues {
    name: string;
    campaigns: string;
    category: string;
    details: string;
    couponValue?: number | null;
    itemCategory?: string;
    discountPercent?: number | null;
    maxDiscountPoints?: number | null;
    minimumSpend?: number | null
    discountAmount?: number | null;
}

interface AddDiscountDialogProps {
    open: boolean
    onClose: () => void
    getData: () => void
}

const discountCategories: string[] = ["Coupon", "On Top", "Seasonal"];

const itemCategory: string[] = ["Clothing", "Footwear", "Bags", "Accessories"]

const AddDiscount = ({ open, onClose, getData }: AddDiscountDialogProps) => {
    const {
        control,
        handleSubmit,
        reset,
        getValues,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            name: "",
            campaigns: "",
            category: "",
            details: "",
            couponValue: null,
            itemCategory: "",
            discountPercent: null,
            maxDiscountPoints: null,
            minimumSpend: null,
            discountAmount: null
        },
    });

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedCampaign, setSelectedCampaign] = useState<string>('');
    const [filteredCampaigns, setFilteredCampaigns] = useState<string[]>([]);

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        const category = event.target.value;
        setSelectedCategory(category);

        const currentValues = getValues();

        reset({
            ...currentValues,
            campaigns: "",
            details: "",
            couponValue: null,
            itemCategory: "",
            discountPercent: null,
            maxDiscountPoints: null,
            minimumSpend: null,
            discountAmount: null
        });

        if (category === "Coupon") {
            setFilteredCampaigns(["Fixed amount", "Percentage discount"]);
        } else if (category === "On Top") {
            setFilteredCampaigns(["Percentage discount by item category", "Discount by points"]);
        } else if (category === "Seasonal") {
            setFilteredCampaigns(["Special campaigns"]);
        }
    }

    const handleCampaignsChange = (event: SelectChangeEvent<string>) => {
        const campaign = event.target.value
        setSelectedCampaign(campaign)

        const currentValues = getValues();

        reset({
            ...currentValues,
            details: "",
            couponValue: null,
            itemCategory: "",
            discountPercent: null,
            maxDiscountPoints: null,
            minimumSpend: null,
            discountAmount: null
        });
    }

    const handleClose = () => {
        reset({
            name: "",
            campaigns: "",
            category: "",
            details: "",
            couponValue: null,
            itemCategory: "",
            discountPercent: null,
            maxDiscountPoints: null,
            minimumSpend: null,
            discountAmount: null
        });
        console.log("handleclose", getValues())
        setSelectedCategory("")
        setSelectedCampaign("")
        setFilteredCampaigns([])
        onClose()
    }

    const onSubmit = async (data: FormValues) => {
        const category = getValues("category")
        const campaigns = getValues("campaigns")
        const formatData: FormValues = {
            name: data.name,
            campaigns: data.campaigns,
            category: data.category,
            details: data.details,
        };
        if (category === "Coupon") {
            formatData.couponValue = data.couponValue

        } else if (category === "On Top" && campaigns === "Percentage discount by item category") {
            formatData.itemCategory = data.itemCategory
            formatData.discountPercent = data.discountPercent

        } else if (category === "On Top" && campaigns === "Discount by points") {
            formatData.maxDiscountPoints = data.maxDiscountPoints

        } else if (category === "Seasonal") {
            formatData.minimumSpend = data.minimumSpend
            formatData.discountAmount = data.discountAmount

        }
        try {
            const response = await axios.post('http://localhost:5000/discounts', formatData);
            console.log("เพิ่มข้อมูลสำเร็จ:", response.data);
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", error);
        }
        handleClose()
        getData()
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Discount</DialogTitle>
            <DialogContent sx={{ gap: '50px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }} >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            name="name"
                            control={control}
                            rules={{
                                required: "Name is required",
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    style={{ marginTop: "16px" }}
                                    label="Name"
                                    fullWidth
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            name="category"
                            control={control}
                            rules={{
                                required: "Category is required",
                            }}
                            render={({ field, fieldState }) => (
                                <FormControl fullWidth error={Boolean(fieldState?.error)} style={{ marginTop: "16px" }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select {...field}
                                        label="Category"
                                        onChange={(e) => {
                                            field.onChange(e);
                                            handleCategoryChange(e);
                                        }}
                                    >
                                        {discountCategories.map((cat) => (
                                            <MenuItem key={cat} value={cat}>
                                                {cat}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                    {fieldState?.error && (
                                        <FormHelperText>{fieldState?.error?.message}</FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />


                        {selectedCategory !== "" &&
                            <Controller
                                name="campaigns"
                                control={control}
                                rules={{
                                    required: "Campaigns is required",
                                }}
                                render={({ field, fieldState }) => (
                                    <FormControl fullWidth error={Boolean(fieldState?.error)} style={{ marginTop: "16px" }}>
                                        <InputLabel>Campaigns</InputLabel>
                                        <Select {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleCampaignsChange(e)
                                            }}
                                            label="Campaigns"
                                            disabled={!selectedCategory}
                                        >
                                            {filteredCampaigns.map((camp) => (
                                                <MenuItem key={camp} value={camp}>
                                                    {camp}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldState?.error && (
                                            <FormHelperText>{fieldState?.error?.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        }

                        <Controller
                            name="details"
                            control={control}
                            rules={{
                                required: "Details is required",
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    style={{ marginTop: "16px" }}
                                    label="Details"
                                    fullWidth
                                    error={Boolean(errors.details)}
                                    helperText={errors.details?.message}
                                />
                            )}
                        />

                        {selectedCategory === "Coupon" && (
                            <Controller
                                name="couponValue"
                                control={control}
                                rules={{
                                    required: "Coupon Value is required",
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value === null ? "" : field.value}
                                        style={{ marginTop: "16px" }}
                                        label="Coupon Value"
                                        type="number"
                                        fullWidth
                                        error={Boolean(errors.couponValue)}
                                        helperText={errors.couponValue?.message}
                                    />
                                )}
                            />
                        )}

                        {selectedCategory === "On Top" && selectedCampaign === "Percentage discount by item category" && (
                            <>
                                <Controller
                                    name="itemCategory"
                                    control={control}
                                    rules={{
                                        required: "Item Category is required",
                                    }}
                                    render={({ field, fieldState }) => (
                                        <FormControl fullWidth error={Boolean(fieldState?.error)} style={{ marginTop: "16px" }}>
                                            <InputLabel>Item Category</InputLabel>
                                            <Select {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                                label="Item Category"
                                            >
                                                {itemCategory.map((item) => (
                                                    <MenuItem key={item} value={item}>
                                                        {item}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {fieldState?.error && (
                                                <FormHelperText>{fieldState?.error?.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                                <Controller
                                    name="discountPercent"
                                    control={control}
                                    rules={{
                                        required: "Discount Percentage is required",
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value === null ? "" : field.value}
                                            style={{ marginTop: "16px" }}
                                            label="Discount Percentage"
                                            type="number"
                                            fullWidth
                                            error={Boolean(errors.discountPercent)}
                                            helperText={errors.discountPercent?.message}
                                            onChange={(e) => {
                                                field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                            }}
                                        />
                                    )}
                                />
                            </>
                        )}

                        {selectedCategory === "On Top" && selectedCampaign === "Discount by points" && (
                            <Controller
                                name="maxDiscountPoints"
                                control={control}
                                rules={{
                                    required: "Max Discount Points is required",
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value === null ? "" : field.value}
                                        style={{ marginTop: "16px" }}
                                        label="Max Discount Points"
                                        type="number"
                                        fullWidth
                                        error={Boolean(errors.maxDiscountPoints)}
                                        helperText={errors.maxDiscountPoints?.message}
                                        onChange={(e) => {
                                            field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                        }}
                                    />
                                )}
                            />
                        )}

                        {selectedCategory === "Seasonal" && selectedCampaign === "Special campaigns" && (
                            <>
                                <Controller
                                    name="minimumSpend"
                                    control={control}
                                    rules={{
                                        required: "Minimum Spend is required",
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value === null ? "" : field.value}
                                            style={{ marginTop: "16px" }}
                                            label="Minimum Spend"
                                            type="number"
                                            fullWidth
                                            error={Boolean(errors.minimumSpend)}
                                            helperText={errors.minimumSpend?.message}
                                            onChange={(e) => {
                                                field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                            }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="discountAmount"
                                    control={control}
                                    rules={{
                                        required: "Discount Amount is required",
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            value={field.value === null ? "" : field.value}
                                            style={{ marginTop: "16px" }}
                                            label="Discount Amount"
                                            type="number"
                                            fullWidth
                                            error={Boolean(errors.discountAmount)}
                                            helperText={errors.discountAmount?.message}
                                            onChange={(e) => {
                                                field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                            }}
                                        />
                                    )}
                                />
                            </>
                        )}

                        <DialogActions>
                            <Button onClick={handleClose}>ยกเลิก</Button>
                            <Button type="submit" onClick={handleSubmit(onSubmit)} variant="contained">
                                บันทึก
                            </Button>
                        </DialogActions>
                    </form>
                </Box>
            </DialogContent>
        </Dialog >
    )
}

export default AddDiscount
