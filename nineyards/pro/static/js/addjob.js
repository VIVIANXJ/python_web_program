const _getName = (id, lst) => {
    for (let v of lst) {
        if (parseInt(v.id) === parseInt(id)) {
            if ('name' in v)
                return v.name;
            return v.firstname + ' ' + v.lastname;
        }
    }
};

const vueInit = (data) => {
    console.log(data);
    const vueApp = {
        data() {
            // Data initialization
            return {
                managers: data.managers.map((ele) => {
                    return {
                        id: ele.id,
                        name: _getName(ele.id, data.profiles)
                    }
                }),
                clients: data.clients.map((ele) => {
                    return {
                        id: ele.id,
                        name: _getName(ele.id, data.profiles)
                    }
                }),
                team_members: data.team_members.map((ele) => {
                    return {
                        id: ele.id,
                        name: _getName(ele.id, data.profiles)
                    }
                }),
                tactions: data.actions.map(ele => {
                    ele.add = false;
                    return ele;
                }),
                profiles: data.profiles,
                categories: data.categories,
                phases: data.phases,
                jobName: '',
                manager: 0,
                client: 0,
                phase: 0,
                actionName: '',
                actionDescription: '',
                startDate: '',
                dueDate: '',
                category: 0,
                personInCharge: 0,
                phasePad: false,
                categoryPad: false,
                templatePad: false,
                actionsPad: false,
                addedManagers: [],
                addedClients: [],
                addedActions: [],
                addedTeamMembers: [],
                width: document.getElementById("vue-container").clientWidth,
            };
        },
        mounted() {
            this.width = document.getElementById("vue-container").clientWidth;
            const that = this;
            window.onresize = () => {
                that.width = document.getElementById("vue-container").clientWidth;
            };
        },
        computed: {
            managerNames() {
                const lst = this.addedManagers.map(ele => _getName(ele, this.profiles));
                if (this.manager)
                    lst.push(_getName(this.manager, this.profiles));
                return lst;
            },
            clientNames() {
                const lst = this.addedClients.map(ele => _getName(ele, this.profiles));
                if (this.client)
                    lst.push(_getName(this.client, this.profiles));
                return lst;
            },
            actionInfos() {
                const toReadable = (act) => {
                    return {
                        name: act.name,
                        description: act.description,
                        startDate: act.startDate,
                        dueDate: act.dueDate,
                        category: _getName(act.category, this.categories),
                        phase: _getName(act.phase, this.phases),
                        personInCharge: act.personInCharge.map(ele => _getName(ele, this.team_members)).join(', ')
                    }
                };
                const lst = this.addedActions.map(ele => toReadable(ele));
                const teammembers = this.addedTeamMembers.slice();
                if (this.personInCharge) teammembers.push(this.personInCharge);
                if (this.actionName && this.startDate && this.dueDate && this.category && teammembers && this.phase) {
                    lst.push(toReadable({
                        name: this.actionName,
                        description: this.actionDescription,
                        startDate: this.startDate,
                        dueDate: this.dueDate,
                        category: this.category,
                        personInCharge: teammembers,
                        phase: this.phase
                    }));
                }
                // lst.push({
                //     name: 'name',
                //     startDate: '2020-10-10',
                //     dueDate: '2021-10-10',
                //     category: 'aaa',
                //     phase: 'bbb',
                //     personInCharge: 'aaa'
                // });
                return lst;
            }
        },
        methods: {
            // Add a new Manager to the job
            addNewManager() {
                if (this.manager !== 0) {
                    this.addedManagers.push(this.manager);
                    this.manager = 0;
                }
            },
            // Add a new client to the job
            addNewClient() {
                if (this.client !== 0) {
                    this.addedClients.push(this.client);
                    this.client = 0;
                }
            },
            // Add a new phase to the job
            addNewPhase() {
                if (this.phase !== 0) {
                    this.actionPlus();
                    this.phase = 0;
                }
            },
            // Add a new action to the job
            actionPlus() {
                this.addNewTeamMember();
                if (this.addedTeamMembers.length === 0)
                    return;
                if (this.category === 0)
                    return;
                if (this.actionName === '')
                    return;
                if (!this.startDate)
                    return;
                if (!this.dueDate)
                    return;
                if (this.phase === 0)
                    return;
                if (this.category === 0)
                    return;
                this.addedActions.push({
                    name: this.actionName,
                    description: this.actionDescription,
                    startDate: this.startDate,
                    dueDate: this.dueDate,
                    category: this.category,
                    personInCharge: this.addedTeamMembers,
                    phase: this.phase
                });
                this.actionName = '';
                this.actionDescription = '';
                this.startDate = '';
                this.dueDate = '';
                this.category = 0;
                this.addedTeamMembers = [];
            },
            // Add a new Team member in Action
            addNewTeamMember() {
                if (this.personInCharge !== 0) {
                    this.addedTeamMembers.push(this.personInCharge);
                    this.personInCharge = 0;
                }
            },
            // Add/Edit Phase
            savePhases(items) {
                $.post(location.href, {
                    phase: JSON.stringify(items)
                }, () => {
                    location.reload();
                });
                this.phasePad = false;
            },
            // Add/Edit Category
            saveCategories(items) {
                $.post(location.href, {
                    category: JSON.stringify(items)
                }, () => {
                    location.reload();
                });
                this.category = false;
            },
            // Save Job
            save() {
                this.addNewManager();
                this.addNewClient();
                this.actionPlus();
                const info = {
                    name: this.jobName,
                    managers: this.addedManagers,
                    clients: this.addedClients,
                    actions: this.addedActions
                };
                $.post(location.href, {
                    info: JSON.stringify(info)
                }, (data) => {
                    location.href = data.url;
                });
            },
            // Edit the Action in the Template
            updateTAction(id, k, v) {
                console.log(id, k, v);
                for (let i = 0; i < this.tactions.length; i++) {
                    const act = this.tactions[i];
                    if (act.id === id) {
                        if (k === 'delete') {
                            this.tactions.splice(i, 1);
                        }
                        else
                            act[k] = v;
                        break;
                    }
                }
            },
            // Save Template
            saveTemplate() {
                const info = {};
                for (let act of this.tactions) {
                    info[`action_name_${act.id}`] = act.name;
                    info[`action_category_${act.id}`] = act.category_id;
                    info[`action_person_${act.id}`] = act.person_in_charge_id;
                    info[`action_due_date_${act.id}`] = act.due_date;
                }
                console.log(info);
                $.post("./phasetemplate", info, () => {
                    for (let act of this.tactions) {
                        if (!act.added) continue;
                        this.addedActions.push({
                            name: act.name,
                            description: '',
                            startDate: new Date().toISOString().slice(0, 10),
                            dueDate: act.due_date,
                            category: act.category_id,
                            personInCharge: [act.person_in_charge_id],
                            phase: act.phase_id
                        });
                    }
                });
            },
            changeStartDate(idx, val) {
                if (idx === this.addedActions.length) {
                    this.startDate = val;
                }
                else {
                    this.addedActions[idx].startDate = val;
                }
            },
            actionRemove(idx) {
                if (idx === this.addedActions.length) {
                    this.actionName = '';
                    this.actionDescription = '';
                    this.startDate = '';
                    this.dueDate = '';
                    this.category = 0;
                    this.personInCharge = 0;
                    this.addedTeamMembers = [];
                }
                else {
                    this.addedActions.splice(idx, 1);
                }
            },
            managerRemove(idx) {
                if (idx === this.addedManagers.length) {
                    this.manager = '';
                }
                else {
                    this.addedManagers.splice(idx, 1);
                }
            },
            clientRemove(idx) {
                if (idx === this.addedClients.length) {
                    this.client = '';
                }
                else {
                    this.addedClients.splice(idx, 1);
                }
            }
        }
    };
    const app = Vue.createApp(vueApp);
    // Custom multi-option Component
    app.component('multi-add-select', {
        props: ['title', 'items', 'modelValue'],
        emits: ['addNewItem', 'update:modelValue'],
        template: `
            <div class="multi-add-select-container">
                <button class="add-but" @click="$emit('addNewItem')">+</button>
                <div class="select-container">
                    <label>{{ title }}</label>
                    <select :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
                        <option
                            v-for="item in items"
                            :key="item.id"
                            :value="item.id"
                        >
                            {{ item.name }}
                        </option>
                    </select>
                </div>
            </div>
        `
    });
    // Custom Input
    app.component('normal-input', {
        props: ['title', 'classinfo', 'modelValue', 'type'],
        emits: ['update:modelValue'],
        template: `
            <div class="text-input-container" :class="classinfo">
                <label>{{ title }}</label>
                <input :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">
            </div>
        `
    });
    // Custom Select
    app.component('simple-select', {
        props: ['title', 'modelValue', 'items'],
        emits: ['update:modelValue'],
        template: `
            <div class="action-input">
                <label>{{ title }}</label>
                <select
                    :value="modelValue"
                    @change="$emit('update:modelValue', $event.target.value)"
                >
                    <option
                        v-for="item in items"
                        :key="item.id"
                        :value="item.id"
                    >
                        {{ item.name }}
                    </option>
                </select>
            </div>
        `
    });
    // Edit/add box of Phase/Category
    app.component('list-edit', {
        props: ['title', 'items'],
        emits: ['save', 'cancel'],
        data() {
            return {
                cur_input: '',
                last_id: parseInt(this.$props.items[this.$props.items.length - 1].id),
                oitems: this.$props.items
            }
        },
        template: `
            <div class="list-edit-container">
                <div class="list-edit-title">{{ title }}</div>
                <div class="items-container">
                    <div v-for="item in oitems" :key="item.id" class="list-item">
                        <input type="text" v-model="item.name">
                        <button class="remove-but" @click="remove(item.id)" style="display: none">-</button>
                    </div>
                    <div class="item-input">
                        <input type="text" v-model="cur_input">
                        <button class="remove-but" @click="addNewItem">+</button>
                    </div>
                </div>
                <div style="text-align: center;">
                    <button class="blue" @click="save">Save</button>
                    <button class="yellow" @click="$emit('cancel')">Cancel</button>
                </div>
            </div>
        `,
        methods: {
            // Add a new Phase/Category
            addNewItem() {
                this.oitems.push({
                    id: parseInt(this.oitems[this.oitems.length - 1].id) + 1,
                    name: this.cur_input
                })
            }, // Save
            save() {
                this.$emit('save', this.oitems.map(ele => {
                    return {
                        pk: ele.id > this.last_id ? 0 : ele.id,
                        name: ele.name
                    }
                }));
            }, // Delete
            remove(id) {
                for (let i = 0; i < this.oitems.length; i++) {
                    if (this.oitems[i].id === id) {
                        this.oitems.splice(i, 1);
                        break;
                    }
                }
            }
        }
    });
    // TemplateAction Component
    app.component('template-action', {
        props: ['info', 'updateTAction', 'categories', 'members', 'phase'],
        template: `
            <div v-if="phase === info.phase_id" class="phase-action">
                <div class="action-name">
                    <i class="fa fa-trash-o action-delete" @click="updateTAction(info.id, 'delete', '')"></i>
                    <div class="action-info" style="margin-left: 20px;">
                        <input type="text" :value="info.name" @input="updateTAction(info.id, 'name', $event.target.value)">
                    </div>
                </div>
                <div class="action-category">
                    <div class="action-info">
                        <select :value="info.category_id" @change="updateTAction(info.id, 'category_id', $event.target.value)">
                            <option v-for="cat in categories" :value="cat.id">
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="action-person">
                    <div class="action-info">
                        <select :value="info.person_in_charge_id" @change="updateTAction(info.id, 'person_in_charge_id', $event.target.value)">
                            <option v-for="per in members" :value="per.id">
                                {{ per.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="action-due-date">
                    <div class="action-info">
                        <input type="date" style="width: 115px;" :value="info.due_date" @change="updateTAction(info.id, 'due_date', $event.target.value)">
                        <input type="checkbox" :value="info.added" @change="updateTAction(info.id, 'added', $event.target.value)">
                    </div>
                </div>
            </div>
        `,
    });
    // A Phase Component in the Template page
    app.component('phase-container', {
        props: ['phase', 'tactions', 'updateTAction', 'categories', 'members'],
        template: `
            <div class="phase">
                <div class="phase-header" :class="'phase-color-' + phase.id % 4">
                    {{ phase.name }}
                    <div class="add-action" @click="$emit('addAction', phase.id)">+</div>
                </div>
                <div class="phase-action-header">
                    <div>Name</div>
                    <div>Category</div>
                    <div>Member</div>
                    <div>Due Date</div>
                </div>
                <div class="phase-action-container">
                    <template-action
                        v-for="act in tactions"
                        :key="act.id"
                        :update-t-action="updateTAction"
                        :info="act"
                        :phase="phase.id"
                        :categories="categories"
                        :members="members"
                    ></template-action>
                </div>
            </div>
        `
    })
    // Template Component
    app.component('template-container', {
        props: ['phases', 'tactions', 'updateTAction', 'categories', 'members'],
        emits: ['cancel', 'save'],
        template: `
            <div class="template-container">
                <div class="info-title">
                    <span style="color: rgb(255, 101, 59)">P</span>hase <span style="color: rgb(65, 118, 247)">T</span>emplate
                </div>
                <div class="phase-container">
                    <phase-container
                        v-for="phase in phases"
                        :key="phase.id"
                        :phase="phase"
                        :tactions="tactions"
                        :update-t-action="updateTAction"
                        :categories="categories"
                        :members="members"
                        @add-action="addAction"
                    ></phase-container>
                </div>
                <button class="blue" style="padding: 8px 20px" @click="$emit('save');$emit('cancel');">Save</button>
                <button class="yellow" style="padding: 8px 20px" @click="$emit('cancel')">Cancel</button>
            </div>
        `,
        methods: {
            addAction(id) {
                $.post("./phasetemplate", {
                    id: id
                }, (data) => {
                    this.tactions.push({
                        id: data.id,
                        phase_id: id,
                        category_id: 0,
                        person_in_charge_id: 0,
                        due_date: ''
                    })
                });
            }
        }
    });
    app.component('actions-container', {
        props: ['actions', 'managers', 'clients'],
        emits: ['close', 'startdate', 'actionremove', 'managerremove', 'clientremove'],
        template: `
            <div class="actions-container">
                <div class="names-container">
                    <label>Job Managers:</label>
                    <div v-for="(man, idx) in managers" :key="idx" class="jobnames">
                        {{ man }} <i class="fa fa-trash-o" @click="$emit('managerremove', idx)"></i>
                    </div>
                </div>
                <div class="names-container">
                    <label>Job Clients:</label>
                    <div v-for="(cli, idx) in clients" :key="idx" class="jobnames">
                        {{ cli }} <i class="fa fa-trash-o" @click="$emit('clientremove', idx)"></i>
                    </div>
                </div>
                <div class="actions-list">
                    <div
                        class="alist-cont"
                        v-for="(act, idx) in actions"
                        :key="idx"
                    >
                        <div class="alst-name">{{ act.name }} <i class="fa fa-trash-o" @click="$emit('actionremove', idx)" style="float: right;"></i></div>
                        <div class="alst-desc">{{ act.description }}</div>
                        <div style="padding-left: 20px;">
                            <div class="alst-date"><b>Start Date:</b> <input type="date" :value="act.startDate" @change="$emit('startdate', idx, $event.target.value)"></div>
                            <div class="alst-date"><b>Due Date:</b> {{ act.dueDate }}</div>
                            <div class="alst-cat"><b>Category:</b> {{ act.category }}</div>
                            <div class="alst-mem"><b>Person in charge:</b> {{ act.personInCharge }}</div>
                            <div class="alst-phase"><b>Phase:</b> {{ act.phase }}</div>
                        </div>
                    </div>
                </div>
                <div style="text-align: center">
                    <button class="yellow" style="padding: 8px 20px" @click="$emit('close')">Close</button>
                </div>
            </div>
        `,
        methods: {
            
        }
    })
    app.mount('#vue-container');
};

$.get(location.href + '?data=yes', (data) => {
    vueInit(data);
});
