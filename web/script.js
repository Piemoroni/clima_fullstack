const API_URL = 'http://localhost:3000';

const loginSection = document.getElementById('loginSection');
const homeSection = document.getElementById('homeSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');
const userNameDisplay = document.getElementById('userName');

const eventoForm = document.getElementById('eventoForm');
const formTitle = document.getElementById('formTitle');
const eventoIdInput = document.getElementById('eventoId');
const cidadeInput = document.getElementById('cidade');
const tipoEventoInput = document.getElementById('tipoEvento');
const temperaturaInput = document.getElementById('temperatura');
const btnSave = document.getElementById('btnSave');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const eventosTableBody = document.getElementById('eventosTableBody');

let loggedUser = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function checkAuth() {
    const user = localStorage.getItem('usuarioClimatico');
    if (user) {
        try {
            loggedUser = JSON.parse(user);
            showHomeScreen();
        } catch (e) {
            localStorage.removeItem('usuarioClimatico');
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    loginSection.classList.remove('hidden');
    homeSection.classList.add('hidden');
}

function showHomeScreen() {
    loginSection.classList.add('hidden');
    homeSection.classList.remove('hidden');
    userNameDisplay.textContent = loggedUser ? loggedUser.nome : 'Usuário';
    loadEventos();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value.trim();

    try {
        const response = await fetch(`${API_URL}/usuario/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'E-mail ou senha inválidos');
        }

        localStorage.setItem('usuarioClimatico', JSON.stringify(data));
        loggedUser = data;
        showHomeScreen();
    } catch (err) {
        console.error("Erro no login:", err);
        loginError.textContent = err.message || "Erro ao conectar com o servidor.";
    }
});

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('usuarioClimatico');
    loggedUser = null;
    showLoginScreen();
});

async function loadEventos() {
    try {
        const response = await fetch(`${API_URL}/evento/listar`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Erro ao buscar eventos');
        
        const eventos = await response.json();

        if (Array.isArray(eventos)) {
            const eventosDoUsuario = eventos.filter(ev => Number(ev.usuarioId) === Number(loggedUser.id));
            renderTable(eventosDoUsuario);
        } else {
            renderTable([]);
        }
    } catch (err) {
        console.error('Erro ao carregar eventos:', err);
    }
}

function renderTable(eventos) {
    eventosTableBody.innerHTML = '';

    if (!eventos || eventos.length === 0) {
        eventosTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 20px;">Nenhum evento registado por si.</td></tr>`;
        return;
    }

    eventos.forEach(ev => {
        const tr = document.createElement('tr');
        const dataFormatada = ev.data ? new Date(ev.data).toLocaleDateString('pt-BR') : 'N/A';
        const temp = ev.temperaturaMaxima !== null && ev.temperaturaMaxima !== undefined ? `${ev.temperaturaMaxima} °C` : 'N/A';
        const impacto = ev.nivelImpacto || ev.descricao || 'N/A';

        tr.innerHTML = `
            <td><strong>#${ev.id}</strong></td>
            <td><strong>${ev.cidade}</strong></td>
            <td>${ev.tipoEvento}</td>
            <td>${temp}</td>
            <td>${impacto}</td>
            <td>${dataFormatada}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-sm" type="button" onclick="editEvento(${ev.id}, '${ev.cidade}', '${ev.tipoEvento}', ${ev.temperaturaMaxima}, '${impacto}')">Editar</button>
                <button class="btn btn-danger btn-sm" type="button" onclick="deleteEvento(${ev.id})">Excluir</button>
            </td>
        `;
        eventosTableBody.appendChild(tr);
    });
}

eventoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = eventoIdInput.value;
    const campoImpacto = document.getElementById('nivelImpacto') || document.getElementById('descricaoImpacto');
    const impactoValor = campoImpacto ? campoImpacto.value.trim() : '';

    const payload = {
        usuarioId: Number(loggedUser.id),
        cidade: cidadeInput.value.trim(),
        tipoEvento: tipoEventoInput.value.trim(),
        temperaturaMaxima: temperaturaInput.value ? parseFloat(temperaturaInput.value) : null,
        nivelImpacto: impactoValor
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/evento/atualizar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_URL}/evento/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) {
            throw new Error('Falha ao salvar o evento');
        }

        resetForm();
        loadEventos();
    } catch (err) {
        console.error('Erro ao salvar evento:', err);
        alert('Erro ao salvar o evento. Verifique os campos.');
    }
});

window.editEvento = function(id, cidade, tipoEvento, temperatura, nivelImpacto) {
    eventoIdInput.value = id;
    cidadeInput.value = cidade;
    tipoEventoInput.value = tipoEvento;
    temperaturaInput.value = temperatura !== null && temperatura !== 'null' ? temperatura : '';
    
    const campoImpacto = document.getElementById('nivelImpacto') || document.getElementById('descricaoImpacto');
    if (campoImpacto) campoImpacto.value = nivelImpacto;

    formTitle.textContent = 'Editar Evento #' + id;
    btnSave.textContent = 'Atualizar Evento';
    btnCancelEdit.classList.remove('hidden');
};

btnCancelEdit.addEventListener('click', resetForm);

function resetForm() {
    eventoIdInput.value = '';
    eventoForm.reset();
    formTitle.textContent = '✨ Registrar Novo Evento';
    btnSave.textContent = 'Salvar Evento';
    btnCancelEdit.classList.add('hidden');
}

window.deleteEvento = async function(id) {
    if (confirm(`Deseja realmente excluir o evento climático #${id}?`)) {
        try {
            const response = await fetch(`${API_URL}/evento/excluir/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir evento');
            }

            loadEventos();
        } catch (err) {
            console.error('Erro ao excluir evento:', err);
        }
    }
};