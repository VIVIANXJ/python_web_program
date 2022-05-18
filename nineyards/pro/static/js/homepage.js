const vueInit = (data) => {
    console.log(data);
    const valInArray = (val, arr) => {
        for (let v of arr) {
            if (val == v) return true;
        }
        return false;
    }
    const vueApp = {
        data() {
            // Data initialization
            const user_id_2_name = {};
            for (let user of data.users) {
                for (let profile of data.profiles) {
                    if (profile.user_id === user.id) {
                        user_id_2_name[user.id] = profile.firstname + ' ' + profile.lastname;
                    }
                }
            }
            for (let i = 0; i < data.actions.length; i++) {
                data.actions[i].det = data.action_details[i];
                data.actions[i].person_in_charge = [];
                for (let am of data.actionmembers) {
                    if (am.action_id === data.actions[i].id) {
                        data.actions[i].person_in_charge.push(am.person_in_charge_id);
                    }
                }
            }
            let filtered_jobs = [];
            console.log('data:', data);
            for (let job of data.jobs) {
                job.managers = [];
                job.clients = [];
                job.manager_names = '';
                for (let jm of data.jobmanagers) {
                    if (job.id === jm.job_id) {
                        job.managers.push(jm.manager_id);
                        job.manager_names += user_id_2_name[jm.manager_id] + ', ';
                    }
                }
                job.manager_names = job.manager_names.slice(0, -2);
                for (let jc of data.jobclients) {
                    if (job.id === jc.job_id) {
                        job.clients.push(jc.client_id);
                    }
                }
                console.log('job:', job);
                console.log('user_id:', user_id);
                console.log(job.managers);
                if (usertype === 'Manager' && !valInArray(user_id, job.managers)) {
                    continue;
                }
                if (usertype === 'Client' && !valInArray(user_id, job.clients)) {
                    continue;
                }
                if (usertype === 'Team Member') {
                    let found = false;
                    for (let action of data.actions) {
                        if (action.job_id === job.id) {
                            if (valInArray(user_id, action.person_in_charge)) {
                                found = true;
                                action.mine = true;
                            }
                        }
                    }
                    if (!found) {
                        continue;
                    }
                }
                if (job.red_cnt) {
                    job.status = 'status-Red';
                }
                else if (job.yellow_cnt) {
                    job.status = 'status-Yellow';
                }
                else {
                    job.status = 'status-Blue';
                }
                if (usertype === 'Manager' || usertype === 'Client') {
                    for (let action of data.actions) {
                        if (action.job_id === job.id) {
                            action.mine = true;
                        }
                    }
                }
                filtered_jobs.push(job);
            }
            console.log(data.jobs);
            return {
                jobs: filtered_jobs,
                selJob: 0,
                actions: data.actions.filter(ele => ele.mine),
                phases: data.phases,
                selected_action: 0,
                usertype: usertype,
                expanded: false
            };
        },
        computed: {
            // Action list displayed after selecting Job
            filtered_actions() {
                const facts = [];
                for (let action of this.actions) {
                    if (this.selJob === 0 || action.job_id === this.selJob) {
                        facts.push(action);
                    }
                }
                return facts;
            }
        },
        methods: {
            jobDelete(id) {
                $.get(`./deletejob/${id}`, () => {
                    location.reload();
                })
            },
            jobClick(id) {
                this.selJob = id;
            },
            // Modify milestone's name
            changeMile(name) {
                for (let action of this.actions) {
                    if (action.selected) {
                        action.milestone = name;
                        $.post(location.href, {
                            pk: action.id,
                            milestone: name
                        }, () => {
                
                        });
                    }
                }
            },
            // Select action
            select(id) {
                for (let action of this.actions) {
                    action.selected = action.id === parseInt(id);
                }   
            }
        }
    };
    const app = Vue.createApp(vueApp);
    // upper part of Job Component
    app.component('job-table', {
        props: ['jobs', 'isman', 'expanded'],
        emits: ['jobClick', 'jobDelete'],
        template: `
            <div style="height: 200px; overflow-y: auto;" v-if="!expanded">
                <table id="job_table">
                    <tr>
                        <th></th>
                        <th>Manager Name</th>
                        <th>Date Due</th>
                        <th>Status</th>
                        <th v-if="isman"></th>
                    </tr>
                    <tr v-for="job in jobs" :key="job.id">
                        <td @click="$emit('jobClick', job.id)">{{ job.name }}</td>
                        <td @click="$emit('jobClick', job.id)">{{ job.manager_names }}</td>
                        <td @click="$emit('jobClick', job.id)">{{ job.due }}</td>
                        <td @click="$emit('jobClick', job.id)">
                            <div :class="[job.status, 'status']"></div>
                        </td>
                        <td v-if="isman"><i class="fa fa-trash-o" @click="$emit('jobDelete', job.id)"></i></td>
                    </tr>
                </table>
            </div>
        `
    });
    // Component showing a Gantt chart of action/phase/milestone
    app.component('gantt-bar', {
        props: ['info', 'idx', 'st_pos'],
        emits: ['select'],
        data() {
            return {
            };
        },
        template: `
            <div v-if="info.type === 'phase'"
                :style="{
                    top: idx * 30 + 60 + 12 + 'px',
                    left: 20 * (info.start - st_pos) + 20 + 'px',
                    width: 20 * (info.end - info.start) + 20 + 'px',
                }"
                class="phase-bar"
            ></div>
            <div v-else-if="info.type === 'action'"
                :style="{
                    top: idx * 30 + 60 + 10 + 'px',
                    left: 20 * (info.start - st_pos) + 20 + 'px',
                    width: 20 * (info.end - info.start) + 20 + 'px',
                }"
                :class="['action-bar', 'status-' + info.color, { selected: info.selected }]"
                @click="$emit('select', info.id.slice(7))"
            ></div>
            <div v-else
                :class="['milestone-bar', { selected: info.selected }]"
                :style="{
                    top: idx * 30 + 60 + 10 + 'px',
                    left: 20 * (info.end - st_pos) + 25 + 'px',
                }"
                @click="$emit('select', info.id.slice(5))"
            ></div>
        `
    });
    // Gantt Chart Component
    app.component('gantt-container', {
        props: ['actions', 'phases', 'expanded'],
        emits: ['changeMile', 'select', 'expand'],
        data() {
            return {
                mile_editing: false,
                mileName: '',
                width: window.innerWidth - 500,
            }
        },
        mounted() {
            this.width = document.getElementById("gantt_header").clientWidth;
            const that = this;
            window.onresize = () => {
                that.width = document.getElementById("gantt_header").clientWidth;
            };
        },
        computed: {
            info() {
                const bars = [];
                let st_pos = 0, ed_pos = 0;
                for (let phase of this.$props.phases) {
                    let phase_start = 0, phase_end = 0, phase_start_date, phase_due_date;
                    let has_action = false;
                    for (let action of this.$props.actions) {
                        if (action.phase_id !== phase.id) continue;
                        has_action = true;
                        if (st_pos == 0 || st_pos > action.det.start)
                            st_pos = action.det.start;
                        if (ed_pos < action.det.end)
                            ed_pos = action.det.end;
                        if (phase_start == 0 || phase_start > action.det.start) {
                            phase_start = action.det.start;
                            phase_start_date = action.start_date;
                        }
                        if (phase_end < action.det.end) {
                            phase_end = action.det.end;
                            phase_due_date = action.due_date;
                        }
                    }
                    if (!has_action) continue;
                    bars.push({
                        type: 'phase',
                        id: `phase_${phase.id}`,
                        start: phase_start,
                        end: phase_end,
                        start_date: phase_start_date,
                        due_date: phase_due_date,
                        name: phase.name,
                        selected: false
                    });
                    for (let action of this.$props.actions) {
                        if (action.phase_id !== phase.id) continue;
                        bars.push({
                            type: 'action',
                            id: `action_${action.id}`,
                            start: action.det.start,
                            end: action.det.end,
                            start_date: action.start_date,
                            due_date: action.due_date,
                            name: action.name,
                            color: action.status ? action.status : 'Blue',
                            selected: action.selected,
                            url: `./editaction/${action.id}?back=homepage`
                        });
                        if (action.milestone) {
                            bars.push({
                                id: `mile_${action.id}`,
                                start: action.det.end,
                                end: action.det.end,
                                start_date: '',
                                due_date: '',
                                type: 'mile',
                                name: action.milestone,
                                selected: action.selected
                            });
                        }
                    }
                }
                const moment_objs = [];
                console.log(this.width);
                const day_cnt = parseInt((this.width - 500) / 20);
                console.log('day_cnt', day_cnt);
                if (ed_pos - st_pos < day_cnt) {
                    const more = day_cnt - (ed_pos - st_pos);
                    const st_more = parseInt(more / 2);
                    const ed_more = more - st_more;
                    st_pos -= st_more;
                    ed_pos += ed_more;
                }
                const day = ed_pos - st_pos + 2;
                for (let i = 0; i < day; i++) {
                    const t = moment((i + st_pos) * 24 * 3600 * 1000);
                    if (t.weekday() == 1) {
                        moment_objs.push({
                            date: t.format("YYYY-MM-DD"),
                            i: i
                        });
                    }
                }
                return {
                    bars: bars,
                    st_pos: st_pos,
                    ed_pos: ed_pos,
                    day: day,
                    moment_objs: moment_objs,
                }
            }
        },
        methods: {
            select(id) {
                this.$emit('select', id);
                for (let action of this.$props.actions) {
                    if (action.id === parseInt(id)) {
                        if (action.milestone) {
                            this.mileName = action.milestone;
                            this.mile_editing = true;
                        }
                        else {
                            this.mileName = '';
                            this.mile_editing = false;
                        }
                        break;
                    }
                }
            },
            newMilestone() {
                this.mile_editing = true;
                this.mileName = 'milestone';
            },
            saveMilestone() {
                this.$emit('changeMile', this.mileName);
            },
            removeMilestone() {
                this.$emit('changeMile', '');
            }
        },
        template: `
            <div class="my-header blue" style="margin-top: 20px;" id="gantt_header">
                SCHEDULE
                <i :class="['fa', expanded ? 'fa-compress' : 'fa-expand' ]"
                    style="float: left; margin-left: 5px; margin-top: 2px;"
                    @click="$emit('expand')"
                ></i>
                <button class="milestone-but" v-if="!mile_editing" @click="newMilestone">+New Milestone</button>
                <button class="milestone-but" v-if="mile_editing" @click="saveMilestone">Save</button>
                <button class="milestone-but" v-if="mile_editing" @click="removeMilestone" style="right: 220px; color: rgb(255, 128, 96);">Remove</button>
                <input type="text" class="milestone-name" v-if="mile_editing" v-model="mileName">
            </div>
            <div id="gantt_container"
                :style="{
                    height: expanded ? '550px' : '350px'
                }"
            >
                <div class="gantt-inner"
                    :style="{
                        width: 20 * (info.ed_pos - info.st_pos) + 600 + 'px'
                    }"
                >
                    <div class="action-table-container">
                        <table class="action-table">
                            <tr class="header">
                                <th>Action name</th>
                                <th>Duration</th>
                                <th>Start</th>
                                <th>End</th>
                            </tr>
                            <tr
                                :class="d.type + '-info'"
                                v-for="d in info.bars"
                                :key="d.id"
                            >
                                <td v-if="d.type === 'action'" class="table-action-name"><a :href="d.url">{{ d.name }}</a></td>
                                <td v-else class="table-action-name">{{ d.name }}</td>
                                <td v-if="d.type !== 'mile'">{{ d.end - d.start + 1 }} day(s)</td>
                                <td v-else></td>
                                <td>{{ d.start_date }}</td>
                                <td>{{ d.due_date }}</td>
                            </tr>
                        </table>
                    </div>
                    <div
                        class="bar-container"
                        :style="{
                            height: 30 * info.bars.length + 60 + 'px',
                            width: 20 * (info.ed_pos - info.st_pos) + 40 + 'px',
                        }">
                        <div
                            v-for="i in info.day"
                            :style="{
                                position: 'absolute',
                                borderRight: '2px solid rgb(220, 220, 220)',
                                width: '20px',
                                height: info.bars.length * 30 + 30 + 'px',
                                top: '30px',
                                left: i * 20 - 20 + 'px',
                                backgroundColor: (info.st_pos + 2 + i) % 7 > 4 ? 'rgb(220, 220, 220)' : 'transparent',
                            }"
                        >
                            {{ "MTWTFSS"[(info.st_pos + 2 + i) % 7] }}
                        </div>
                        <div
                            :style="{
                                width: info.day * 20 + 'px',
                                height: '30px',
                                top: '0px',
                                left: '0px',
                                backgroundColor: 'rgb(25, 98, 155)'
                            }"
                        >
                            <div
                                v-for="moment in info.moment_objs"
                                :style="{
                                    position: 'absolute',
                                    left: moment.i * 20 + 3 + 'px',
                                    top: '5px',
                                    color: 'white'
                                }"
                            >
                                {{ moment.date }}
                            </div>
                        </div>
                        <gantt-bar
                            v-for="(d, idx) in info.bars"
                            :key="d.id"
                            :info="d"
                            :idx="idx"
                            :st_pos="info.st_pos"
                            @select="select"
                        ></gantt-bar>
                    </div>
                </div>
            </div>
        `
    });
    app.mount('#vue-container');
};

$.get(location.href + '?data=yes', (data) => {
    vueInit(data);
});
