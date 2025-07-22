/**
 * Dashboard Charts Manager
 * Advanced interactive charts for Persian Accounting System
 */

class DashboardCharts {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8',
            purple: '#6f42c1',
            pink: '#e83e8c',
            teal: '#20c997'
        };
        this.gradients = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeCharts());
        } else {
            this.initializeCharts();
        }
    }

    initializeCharts() {
        try {
            this.createGradients();
            this.initDailyRevenueChart();
            this.initOrderStatusChart();
            this.initTopProductsChart();
            this.setupRealTimeUpdates();
            console.log('Dashboard charts initialized successfully');
        } catch (error) {
            console.error('Error initializing dashboard charts:', error);
        }
    }

    createGradients() {
        // Create gradient patterns for charts
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Revenue chart gradient
        const revenueGradient = ctx.createLinearGradient(0, 0, 0, 400);
        revenueGradient.addColorStop(0, 'rgba(0, 123, 255, 0.8)');
        revenueGradient.addColorStop(1, 'rgba(0, 123, 255, 0.1)');
        this.gradients.revenue = revenueGradient;
    }

    initDailyRevenueChart() {
        const ctx = document.getElementById('dailyRevenueChart');
        if (!ctx) return;

        // Get data from template
        const dailyRevenueData = window.dashboardData?.dailyRevenue || [];
        
        if (dailyRevenueData.length === 0) {
            this.showEmptyChart(ctx, 'نمودار درآمد روزانه', 'داده‌ای برای نمایش موجود نیست');
            return;
        }

        const labels = dailyRevenueData.map(item => item.date);
        const data = dailyRevenueData.map(item => item.revenue);

        this.charts.dailyRevenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'درآمد روزانه (تومان)',
                    data: data,
                    borderColor: this.colors.primary,
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `درآمد: ${context.parsed.y.toLocaleString('fa-IR')} تومان`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 1
                        },
                        ticks: {
                            font: {
                                family: 'IRANSans'
                            },
                            callback: function(value) {
                                return value.toLocaleString('fa-IR');
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'IRANSans'
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    initOrderStatusChart() {
        const ctx = document.getElementById('orderStatusChart');
        if (!ctx) return;

        const orderStatusData = window.dashboardData?.orderStatus || [];
        
        if (orderStatusData.length === 0) {
            this.showEmptyChart(ctx, 'وضعیت سفارشات', 'سفارشی موجود نیست');
            return;
        }

        const statusLabels = {
            'pending': 'در انتظار',
            'confirmed': 'تایید شده',
            'producing': 'در حال تولید',
            'completed': 'تکمیل شده',
            'cancelled': 'لغو شده'
        };

        const statusColors = {
            'pending': '#ffc107',
            'confirmed': '#17a2b8',
            'producing': '#fd7e14',
            'completed': '#28a745',
            'cancelled': '#dc3545'
        };

        const labels = orderStatusData.map(item => statusLabels[item.status] || item.status);
        const data = orderStatusData.map(item => item.count);
        const colors = orderStatusData.map(item => statusColors[item.status] || '#6c757d');

        this.charts.orderStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'IRANSans',
                                size: 12
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} سفارش (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 2000
                },
                cutout: '60%'
            }
        });
    }

    initTopProductsChart() {
        const ctx = document.getElementById('topProductsChart');
        if (!ctx) return;

        const topProductsData = window.dashboardData?.topProducts || [];
        
        if (topProductsData.length === 0) {
            this.showEmptyChart(ctx, 'پرفروش‌ترین محصولات', 'داده‌ای موجود نیست');
            return;
        }

        const labels = topProductsData.map(item => item.name);
        const data = topProductsData.map(item => item.total_sold);

        this.charts.topProducts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'تعداد فروش',
                    data: data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ],
                    borderWidth: 0,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `فروش: ${context.parsed.x} عدد`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                family: 'IRANSans'
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'IRANSans',
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    showEmptyChart(ctx, title, message) {
        const container = ctx.parentElement;
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-chart-line fa-3x mb-3"></i>
                <h6>${title}</h6>
                <p class="mb-0">${message}</p>
            </div>
        `;
    }

    setupRealTimeUpdates() {
        // Auto-refresh charts every 5 minutes
        setInterval(() => {
            this.refreshAllCharts();
        }, 300000); // 5 minutes
    }

    async refreshAllCharts() {
        try {
            console.log('Refreshing dashboard charts...');
            
            // Fetch fresh data
            const response = await fetch('/api/dashboard-data');
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            
            const data = await response.json();
            window.dashboardData = data;
            
            // Update all charts
            this.updateDailyRevenueChart(data.dailyRevenue);
            this.updateOrderStatusChart(data.orderStatus);
            this.updateTopProductsChart(data.topProducts);
            
            // Show success notification
            this.showNotification('داده‌های داشبورد به‌روزرسانی شد', 'success');
            
        } catch (error) {
            console.error('Error refreshing charts:', error);
            this.showNotification('خطا در به‌روزرسانی داده‌ها', 'error');
        }
    }

    updateDailyRevenueChart(data) {
        if (!this.charts.dailyRevenue || !data) return;
        
        this.charts.dailyRevenue.data.labels = data.map(item => item.date);
        this.charts.dailyRevenue.data.datasets[0].data = data.map(item => item.revenue);
        this.charts.dailyRevenue.update('active');
    }

    updateOrderStatusChart(data) {
        if (!this.charts.orderStatus || !data) return;
        
        const statusLabels = {
            'pending': 'در انتظار',
            'confirmed': 'تایید شده',
            'producing': 'در حال تولید',
            'completed': 'تکمیل شده',
            'cancelled': 'لغو شده'
        };

        this.charts.orderStatus.data.labels = data.map(item => statusLabels[item.status] || item.status);
        this.charts.orderStatus.data.datasets[0].data = data.map(item => item.count);
        this.charts.orderStatus.update('active');
    }

    updateTopProductsChart(data) {
        if (!this.charts.topProducts || !data) return;
        
        this.charts.topProducts.data.labels = data.map(item => item.name);
        this.charts.topProducts.data.datasets[0].data = data.map(item => item.total_sold);
        this.charts.topProducts.update('active');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Public methods for manual refresh
    refreshDailyRevenue() {
        this.refreshAllCharts();
    }

    destroy() {
        // Cleanup charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Global functions for template access
window.refreshDailyRevenue = function() {
    if (window.dashboardCharts) {
        window.dashboardCharts.refreshDailyRevenue();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on dashboard page
    if (document.getElementById('dailyRevenueChart') || 
        document.getElementById('orderStatusChart') || 
        document.getElementById('topProductsChart')) {
        
        window.dashboardCharts = new DashboardCharts();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardCharts;
}