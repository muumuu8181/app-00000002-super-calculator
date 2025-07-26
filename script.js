/**
 * Super Calculator - Advanced Calculator Application v1.0
 */

class SuperCalculator {
    constructor() {
        // Calculator state
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.lastOperation = null;
        
        // Memory
        this.memory = 0;
        
        // History
        this.history = this.loadHistory();
        
        // Statistics
        this.statistics = {
            calculationCount: 0,
            results: []
        };
        
        // Theme
        this.theme = localStorage.getItem('calculatorTheme') || 'light';
        
        // Initialize
        this.init();
    }

    init() {
        console.log('🔢 Super Calculator v1.0 initializing...');
        
        this.setupEventListeners();
        this.updateDisplay();
        this.updateHistory();
        this.updateStatistics();
        this.applyTheme();
        
        console.log('✅ Super Calculator ready!');
    }

    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.inputNumber(button.dataset.number);
                this.createParticleEffect(button);
            });
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(button => {
            button.addEventListener('click', () => {
                this.inputOperator(button.dataset.operator);
                this.highlightOperator(button);
                this.createParticleEffect(button);
            });
        });

        // Action buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                this.performAction(button.dataset.action);
                this.createParticleEffect(button);
            });
        });

        // Memory buttons
        document.querySelectorAll('[data-memory]').forEach(button => {
            button.addEventListener('click', () => {
                this.performMemoryOperation(button.dataset.memory);
                this.createParticleEffect(button);
            });
        });

        // Scientific functions
        document.querySelectorAll('[data-function]').forEach(button => {
            button.addEventListener('click', () => {
                this.performFunction(button.dataset.function);
                this.createParticleEffect(button);
            });
        });

        // Theme switcher
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Export history
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportHistory();
        });

        // Clear history
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // Help modal
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        // Modal background click
        document.getElementById('helpModal').addEventListener('click', (e) => {
            if (e.target.id === 'helpModal') {
                this.hideModal();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // History item click (to reuse calculation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('history-result')) {
                this.reuseResult(e.target.textContent);
            }
        });
    }

    inputNumber(number) {
        if (this.waitingForOperand) {
            this.currentInput = number;
            this.waitingForOperand = false;
        } else {
            if (number === '.' && this.currentInput.includes('.')) {
                return;
            }
            this.currentInput = this.currentInput === '0' ? number : this.currentInput + number;
        }
        
        this.updateDisplay();
        this.clearOperatorHighlight();
    }

    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === null) {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);

            this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
            this.previousInput = newValue;
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateDisplay();
    }

    performAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'equals':
                this.equals();
                break;
        }
    }

    performMemoryOperation(operation) {
        const current = parseFloat(this.currentInput);
        
        switch (operation) {
            case 'mc':
                this.memory = 0;
                break;
            case 'mr':
                this.currentInput = this.memory.toString();
                this.waitingForOperand = true;
                break;
            case 'm+':
                this.memory += current;
                break;
            case 'm-':
                this.memory -= current;
                break;
        }
        
        this.updateMemoryDisplay();
        this.updateDisplay();
    }

    performFunction(func) {
        const current = parseFloat(this.currentInput);
        let result;

        switch (func) {
            case 'sqrt':
                if (current < 0) {
                    this.showError('負の数の平方根は計算できません');
                    return;
                }
                result = Math.sqrt(current);
                this.addToHistory(`√(${current})`, result);
                break;
            case 'square':
                result = current * current;
                this.addToHistory(`${current}²`, result);
                break;
            case 'percent':
                result = current / 100;
                this.addToHistory(`${current}%`, result);
                break;
            case 'negate':
                result = -current;
                this.addToHistory(`-(${current})`, result);
                break;
        }

        this.currentInput = result.toString();
        this.waitingForOperand = true;
        this.updateDisplay();
        this.updateStatistics();
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.clearOperatorHighlight();
        this.updateDisplay();
    }

    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    equals() {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput !== null && this.operator) {
            const newValue = this.calculate(this.previousInput, inputValue, this.operator);
            
            // Add to history
            const expression = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${inputValue}`;
            this.addToHistory(expression, newValue);
            
            this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
            this.lastOperation = {
                operator: this.operator,
                operand: inputValue
            };
            this.previousInput = null;
            this.operator = null;
            this.waitingForOperand = true;
            
            this.clearOperatorHighlight();
            this.updateDisplay();
            this.updateStatistics();
            this.animateCalculation();
        }
    }

    calculate(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '*':
                return firstOperand * secondOperand;
            case '/':
                if (secondOperand === 0) {
                    this.showError('ゼロで割ることはできません');
                    return firstOperand;
                }
                return firstOperand / secondOperand;
            default:
                return secondOperand;
        }
    }

    updateDisplay() {
        const mainDisplay = document.getElementById('mainDisplay');
        const historyDisplay = document.getElementById('historyDisplay');
        
        // Format number
        const formattedInput = this.formatNumber(this.currentInput);
        mainDisplay.textContent = formattedInput;
        
        // Show current operation
        if (this.previousInput !== null && this.operator) {
            historyDisplay.textContent = `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)}`;
        } else {
            historyDisplay.textContent = '';
        }
    }

    formatNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return '0';
        
        // Handle very large or very small numbers
        if (Math.abs(number) > 999999999 || (Math.abs(number) < 0.000001 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // Format with commas for thousands
        return number.toLocaleString('ja-JP', {
            maximumFractionDigits: 8,
            useGrouping: true
        });
    }

    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷'
        };
        return symbols[operator] || operator;
    }

    addToHistory(expression, result) {
        const historyItem = {
            id: Date.now(),
            expression: expression,
            result: result,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        
        this.saveHistory();
        this.updateHistory();
        
        // Update statistics
        this.statistics.calculationCount++;
        this.statistics.results.push(result);
        this.updateStatistics();
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-text">計算履歴がありません</div>
                    <div class="empty-subtext">計算を実行すると履歴が表示されます</div>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div>
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-time">${this.formatTime(item.timestamp)}</div>
                </div>
                <div class="history-result" title="クリックして再利用">${this.formatNumber(item.result)}</div>
            </div>
        `).join('');
    }

    updateStatistics() {
        document.getElementById('calcCount').textContent = this.statistics.calculationCount;
        
        if (this.statistics.results.length > 0) {
            const max = Math.max(...this.statistics.results);
            const min = Math.min(...this.statistics.results);
            const avg = this.statistics.results.reduce((a, b) => a + b, 0) / this.statistics.results.length;
            
            document.getElementById('maxValue').textContent = this.formatNumber(max);
            document.getElementById('minValue').textContent = this.formatNumber(min);
            document.getElementById('avgValue').textContent = this.formatNumber(avg);
        } else {
            document.getElementById('maxValue').textContent = '-';
            document.getElementById('minValue').textContent = '-';
            document.getElementById('avgValue').textContent = '-';
        }
    }

    updateMemoryDisplay() {
        document.getElementById('memoryDisplay').textContent = `M: ${this.formatNumber(this.memory)}`;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    reuseResult(resultText) {
        // Remove commas and parse
        const cleanResult = resultText.replace(/,/g, '');
        this.currentInput = cleanResult;
        this.waitingForOperand = true;
        this.updateDisplay();
        this.showNotification('履歴の結果を使用しました');
    }

    clearHistory() {
        if (confirm('計算履歴をすべて削除しますか？')) {
            this.history = [];
            this.saveHistory();
            this.updateHistory();
            this.showNotification('履歴をクリアしました');
        }
    }

    exportHistory() {
        if (this.history.length === 0) {
            this.showNotification('エクスポートする履歴がありません');
            return;
        }
        
        const headers = ['時刻', '計算式', '結果'];
        const rows = this.history.map(item => [
            this.formatTime(item.timestamp),
            item.expression,
            item.result
        ]);
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        // Add BOM for Japanese support
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `calculator_history_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('履歴をエクスポートしました');
    }

    highlightOperator(button) {
        this.clearOperatorHighlight();
        button.classList.add('active');
    }

    clearOperatorHighlight() {
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    animateCalculation() {
        const display = document.getElementById('mainDisplay');
        display.classList.add('calculating');
        setTimeout(() => {
            display.classList.remove('calculating');
        }, 500);
    }

    createParticleEffect(button) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-effect';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.transform = `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`;
            
            document.getElementById('effectContainer').appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('calculatorTheme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeBtn = document.getElementById('themeBtn');
        themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }

    showModal() {
        document.getElementById('helpModal').classList.add('active');
    }

    hideModal() {
        document.getElementById('helpModal').classList.remove('active');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? 'var(--danger-color)' : 'var(--success-color)'};
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
            font-weight: 500;
        `;
        notification.textContent = message;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }

    handleKeyboard(e) {
        e.preventDefault();
        
        const key = e.key;
        
        if ('0123456789.'.includes(key)) {
            this.inputNumber(key);
        } else if ('+-*/'.includes(key)) {
            this.inputOperator(key);
        } else if (key === 'Enter' || key === '=') {
            this.equals();
        } else if (key === 'Escape') {
            this.clear();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === 'Delete') {
            this.clearEntry();
        }
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize application
let calculator;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔢 Super Calculator - Advanced Calculator v1.0');
    calculator = new SuperCalculator();
});

// Export for debugging
window.SuperCalculator = SuperCalculator;