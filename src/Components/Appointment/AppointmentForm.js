import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import auth from '../../firebase.init';
import Loading from '../Shared/Loading';
import '../Home/WhyUs/WhyUs.css';
import { format } from 'date-fns';
import { useQuery } from 'react-query';
import { useState } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import './Form.css'

const AppointmentForm = () => {
    const [user, loading, error] = useAuthState(auth);
    const [barber, setBarber] = useState({});

    const [selectedService, setSelectedService] = useState('')
    const { data: service, isLoading: serviceLoading } = useQuery(['service', selectedService], () => fetch(`http://localhost:5000/service?name=${selectedService}`).then(res => res.json()));

    const { data: services, isLoading: servicesLoading } = useQuery('allServices', () => fetch('http://localhost:5000/services').then(res => res.json()));
    const { data: availableAppointments, isLoading: availableLoading } = useQuery('available', () => fetch(`http://localhost:5000/available?date=${formatDate}`).then(res => res.json()));

    useEffect(() => {
        fetch(`http://localhost:5000/barber/${id}`)
            .then(res => res.json())
            .then(data => setBarber(data))
    }, [])

    const appointedBarber = availableAppointments?.find(available => available.barber_name === barber.barber_name);

    const navigate = useNavigate();

    if (loading || servicesLoading || serviceLoading || availableLoading) {
        <Loading></Loading>
    }

    const location = useLocation();
    const { id } = useParams();
    const date = location.state.date;
    const formatDate = format(date, 'PP')

    const handleServiceSelection = (event) => {
        if (event.target.value === 'Default') {
            return
        }
        else {
            setSelectedService(event.target.value);
        }
    }

    const handleBookNow = event => {
        event.preventDefault();
        const clientName = user.displayName;
        const phone = event.target.phone.value;
        const appointment_barber = barber.barber_name;
        const appointment_service = event.target.appointment_service.value;
        const price = event.target.price.value;
        const service_price = price.split(" ")[0];
        const appointment_date = event.target.appointment_date.value;
        const appointment_slot = event.target.appointment_slot.value;

        if (appointment_service === 'Default' || appointment_slot === 'Default') {
            toast.error('Please Fill The Form Properly');
            return;
        }
        else {
            const appointment = {
                clientName,
                appointmentId: id,
                phone,
                email: user.email,
                appointment_barber,
                appointment_service,
                service_price,
                appointment_date,
                appointment_slot,
                payment: 'due'
            };
            fetch('http://localhost:5000/appointments', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(appointment)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success === true) {
                        toast(`Appointment Successful, On ${appointment_date} at ${appointment_slot} to ${appointment_barber}`);
                        navigate('/')
                    }
                    else {
                        toast.error(`Already have an Appointment on ${data.appointment?.appointment_date} at ${data.appointment?.appointment_slot} to ${data.appointment?.appointment_barber}`)
                    }
                })
        }




    }

    return (
        <div className='why-main-div flex justify-center items-center py-8 px-4'>
            <div className='w-full lg:w-1/3 md:w-4/5 py-12 bg-gray-700 rounded-3xl'>
                <h3 className='text-center text-orange-500'>Appointment Form</h3>

                <form onSubmit={handleBookNow} action="" className='grid grid-cols-1 gap-4 justify-items-center my-8 px-4'>

                    <input type="text" value={user.displayName} className="input input-bordered input-success w-full form-input" disabled />

                    <input type="number" name='phone' placeholder="Your Phone Number" className="input input-bordered input-success w-full form-input" required />

                    <input type="text" value={user.email} className="input input-bordered input-success w-full form-input" disabled />

                    <input type="text" value={`Appointment to ${barber.barber_name}`} className="input input-bordered input-success w-full form-input" disabled />

                    <select defaultValue={'Default'} onChange={handleServiceSelection} name='appointment_service' className="select select-success w-full form-input" required>
                        <option value="Default" disabled>Select Service</option>
                        {
                            services?.map(service => <option key={service._id} value={service.service_name} >{service.service_name}</option>)
                        }


                    </select>

                    <input type="text" name='price' value={service ? `${service.service_amount} $` : 'Service Price'} className="input input-bordered input-success w-full form-input" disabled />

                    <input type="text" name='appointment_date' value={formatDate} className="input input-bordered input-success w-full form-input" disabled />

                    <select defaultValue={'Default'} name='appointment_slot' className="select select-success w-full form-input">
                        <option value="Default" disabled>Choose Your Slot</option>
                        {
                            appointedBarber?.slots?.map((slot, index) => <option key={index} value={slot}>{slot}</option>)
                        }


                    </select>

                    <input type="submit" value="BOOK NOW" className='input w-full bg-red-300 text-xl' />


                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;