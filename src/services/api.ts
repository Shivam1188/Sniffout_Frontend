import { getDecryptedItem, setEncryptedItem } from '../utils/storageHelper';

const API_BASE_URL = import.meta.env.VITE_API_URL;


const handleResponse = async (response: Response) => {

    if (response.status === 204 || response.status === 205) {
        return {
            success: true,
            data: null,
            error: null,
        };
    }

    const rawText = await response.text();

    let data;
    try {
        data = JSON.parse(rawText);
    } catch (err) {
        console.error("❌ Failed to parse JSON. Raw response:", rawText);
        throw new Error("Failed to parse JSON response.");
    }

    // Handle error responses properly
    if (!response.ok) {
        console.error("❌ API Error Response:", data);

        // Extract error message from different possible structures
        let errorMessage = 'Something went wrong';

        if (data.errors) {
            // Handle nested errors object like { errors: { order: ["message"] } }
            const errorKeys = Object.keys(data.errors);
            if (errorKeys.length > 0) {
                const firstErrorKey = errorKeys[0];
                const firstError = data.errors[firstErrorKey];
                errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            }
        } else if (data.detail) {
            errorMessage = data.detail;
        } else if (data.message) {
            errorMessage = data.message;
        } else if (data.error) {
            errorMessage = data.error;
        } else if (typeof data === 'string') {
            errorMessage = data;
        }

        throw new Error(errorMessage);
    }

    return {
        success: true,
        data: data,
        error: null,
    };
};

const refreshAccessToken = async () => {
    const refreshToken = getDecryptedItem("refreshToken");
    if (!refreshToken) return null;

    try {
        const res = await fetch(`${API_BASE_URL}auth/refresh-token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const json = await res.json();
        if (res.ok && json.access) {
            setEncryptedItem("token", json.access);
            return json.access;
        }

        return null;
    } catch (err) {
        console.error("Refresh token failed:", err);
        return null;
    }
};

const request = async (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    body?: any,
    includeToken: boolean = true,
    isFileUpload: boolean = false
) => {
    const token = getDecryptedItem("token");
    const headers: any = {};

    if (includeToken && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (!isFileUpload) {
        headers["Content-Type"] = "application/json";
    }

    const fetchOptions: RequestInit = {
        method,
        headers,
        ...(body && { body: isFileUpload ? body : JSON.stringify(body) }),
    };

    const fullUrl = `${API_BASE_URL}${url}`;


    try {
        let response = await fetch(fullUrl, fetchOptions);

        if (response.status === 401 && includeToken) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                setEncryptedItem("token", newToken);
                fetchOptions.headers = {
                    ...fetchOptions.headers,
                    Authorization: `Bearer ${newToken}`,
                };
                response = await fetch(fullUrl, fetchOptions);
            }
        }

        return handleResponse(response);
    } catch (error) {
        console.error("🚨 Fetch error details:", {
            error,
            url: fullUrl,
            method,
            hasToken: !!token
        });
        throw error;
    }
};

class ApiService {
    // Auth API
    async login(credentials: any): Promise<any> {
        const response = await request("POST", "auth/login/", credentials, false);
        return response.data;
    }

    async logout(): Promise<any> {
        const refreshToken = getDecryptedItem("refreshToken");
        if (!refreshToken) {
            throw new Error('No refresh token found');
        }
        const response = await request("POST", "auth/logout/", { refresh: refreshToken });
        return response.data;
    }

    // ==================== SURVEY QUESTION MANAGEMENT ====================

    // Get all survey questions
    async getQuestions(): Promise<any> {
        const response = await request("GET", "subadmin/survey/questions/");
        return response.data;
    }

    // Get specific survey question
    async getQuestion(id: number): Promise<any> {
        const response = await request("GET", `subadmin/survey/questions/${id}/`);
        return response.data;
    }


    async createQuestion(data: any): Promise<any> {
        try {
            const response = await request("POST", "subadmin/survey/questions/", data);
            return response.data;
        } catch (error: any) {
            console.error("❌ Create question error:", error);


            throw error;
        }
    }
    // Update survey question
    async updateQuestion(id: number, data: any): Promise<any> {
        const response = await request("PUT", `subadmin/survey/questions/${id}/`, data);
        return response.data;
    }

    // Delete survey question
    async deleteQuestion(id: number): Promise<any> {
        const response = await request("DELETE", `subadmin/survey/questions/${id}/`);
        return response.data;
    }

    // ==================== SURVEY RESPONSE MANAGEMENT ====================

    // Get all survey responses
    async getSurveyResponses(params: any = {}): Promise<any> {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `subadmin/survey/responses/?${queryString}` : "subadmin/survey/responses/";
        const response = await request("GET", url);
        return response.data;
    }

    // Get survey analytics
    async getAnalytics(params: any = {}): Promise<any> {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `subadmin/survey/analytics/?${queryString}` : "subadmin/survey/analytics/";
        const response = await request("GET", url);
        return response.data;
    }

    // ==================== QR CODE MANAGEMENT ====================

    // Get/Create QR code
    async getQRCode(): Promise<any> {
        const response = await request("GET", "subadmin/survey/qr-code/");
        return response.data;
    }

    // Regenerate QR code
    async regenerateQRCode(): Promise<any> {
        const response = await request("POST", "subadmin/survey/qr-code/");
        return response.data;
    }

    // ==================== PUBLIC SURVEY APIS ====================

    // Get public survey questions (no auth)
    async getPublicSurvey(uniqueCode: string): Promise<any> {
        const response = await request("GET", `subadmin/public/survey/${uniqueCode}/`, null, false);
        return response.data;
    }

    // Submit survey response (no auth)
    async submitSurveyResponse(uniqueCode: string, data: any): Promise<any> {
        const response = await request("POST", `subadmin/public/survey/${uniqueCode}/submit/`, data, false);
        return response.data;
    }

    // ==================== OFFERS API ====================

    // Offers CRUD
    async createOffer(data: any): Promise<any> {
        const response = await request("POST", "subadmin/offers/", data);
        return response.data;
    }

    async getOffers(params: any = {}): Promise<any> {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = queryString ? `subadmin/offers/?${queryString}` : "subadmin/offers/";
            const response = await request("GET", url);
            return response.data;
        } catch (error) {
            console.error("❌ getOffers failed:", error);
            throw error;
        }
    }

    async getOffer(id: number): Promise<any> {
        const response = await request("GET", `subadmin/offers/${id}/`);
        return response.data;
    }

    async updateOffer(id: number, data: any): Promise<any> {
        const response = await request("PUT", `subadmin/offers/${id}/`, data);
        return response.data;
    }

    async deleteOffer(id: number): Promise<any> {
        const response = await request("DELETE", `subadmin/offers/${id}/`);
        return response.data;
    }

    // Offer Actions
    async extendOffer(id: number, data: any): Promise<any> {
        const response = await request("POST", `subadmin/offers/${id}/extend/`, data);
        return response.data;
    }

    async renewOffer(id: number, data: any): Promise<any> {
        const response = await request("POST", `subadmin/offers/${id}/renew/`, data);
        return response.data;
    }

    async duplicateOffer(id: number, data: any): Promise<any> {
        const response = await request("POST", `subadmin/offers/${id}/duplicate/`, data);
        return response.data;
    }

    async toggleActiveStatus(id: number): Promise<any> {
        const response = await request("POST", `subadmin/offers/${id}/toggle-active/`);
        return response.data;
    }

    // Analytics & History
    async getOfferAnalytics(id: number): Promise<any> {
        const response = await request("GET", `subadmin/offers/${id}/analytics/`);
        return response.data;
    }

    async getAllOffersAnalytics(): Promise<any> {
        const response = await request("GET", "subadmin/offers/analytics/all/");
        return response.data;
    }

    async getRedemptionHistory(id: number, params: any = {}): Promise<any> {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `subadmin/offers/${id}/redemptions/?${queryString}` : `subadmin/offers/${id}/redemptions/`;
        const response = await request("GET", url);
        return response.data;
    }

    // Staff Redemption
    async validateRedemption(code: string): Promise<any> {
        const response = await request("POST", "subadmin/offers/validate-redemption/", {
            redemption_code: code
        });
        return response.data;
    }

    async getPublicOffer(uniqueCode: string): Promise<any> {
        const response = await request("GET", `subadmin/public/offer/${uniqueCode}/`, null, false);
        return response.data;
    }

    async initiateRedemption(uniqueCode: string, customerData: any): Promise<any> {
        const response = await request("POST", `subadmin/public/offer/${uniqueCode}/redeem/`, customerData, false);
        return response.data;
    }

    async verifyOTP(redemptionData: any): Promise<any> {
        const response = await request("POST", "subadmin/public/offer/verify-otp/", redemptionData, false);
        return response.data;
    }

    // ==================== ADDITIONAL HELPER METHODS ====================

    // Download QR Code (helper method)
    async downloadQRCode(qrCodeUrl: string): Promise<void> {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-code-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            throw error;
        }
    }

    // Quick action to get offer statistics
    async getOfferStats(): Promise<any> {
        try {
            const response = await this.getOffers();
            const offers = response.results?.offers || response.offers || [];

            const stats = {
                total: offers.length,
                active: offers.filter((offer: any) => offer.is_active && offer.is_valid_now).length,
                inactive: offers.filter((offer: any) => !offer.is_active).length,
                expired: offers.filter((offer: any) => offer.is_active && !offer.is_valid_now).length,
                totalRedemptions: offers.reduce((sum: number, offer: any) => sum + (offer.total_redemptions || 0), 0),
                totalScans: offers.reduce((sum: number, offer: any) => sum + (offer.scan_count || 0), 0)
            };

            return {
                success: true,
                stats
            };
        } catch (error) {
            console.error('Error getting offer stats:', error);
            throw error;
        }
    }

    // Quick action to get survey statistics
    async getSurveyStats(): Promise<any> {
        try {
            const [analyticsResponse, responsesResponse] = await Promise.all([
                this.getAnalytics(),
                this.getSurveyResponses({ page_size: 1 }) // Just to get count
            ]);

            return {
                success: true,
                stats: {
                    totalResponses: responsesResponse.count || 0,
                    averageRating: analyticsResponse.analytics?.average_rating || 0,
                    qrScanCount: analyticsResponse.analytics?.qr_scan_count || 0,
                    responseRate: analyticsResponse.analytics?.response_rate || 0
                }
            };
        } catch (error) {
            console.error('Error getting survey stats:', error);
            throw error;
        }
    }
}

export const apiService = new ApiService();