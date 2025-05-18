import React, { useState, useEffect } from 'react';
import { Container } from '@chakra-ui/react';
import EnhancedInstructorProfile from '../components/EnhancedInstructorProfile.js';
import { useAuth } from '../contexts/AuthContext.js';
import { supabase } from '../services/supabaseClient.js';

function InstructorProfilePage() {
  const { user } = useAuth();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const { data, error } = await supabase
          .from('instructors')
          .select(`
            *,
            courses:courses(*)
          `)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setInstructor({
          ...data,
          name: data.name || user.user_metadata?.full_name || 'Anonymous Instructor',
          avatar: data.avatar_url || user.user_metadata?.avatar_url,
          title: data.title || 'Course Instructor',
          bio: data.bio || 'No bio available yet.',
        });
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        // Set default data if no instructor profile exists
        setInstructor({
          name: user.user_metadata?.full_name || 'Anonymous Instructor',
          avatar: user.user_metadata?.avatar_url,
          title: 'Course Instructor',
          bio: 'No bio available yet.',
          courses: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInstructorData();
    }
  }, [user]);

  return (
    <Container maxW="container.xl" py={8}>
      {instructor && <EnhancedInstructorProfile instructor={instructor} />}
    </Container>
  );
}

export default InstructorProfilePage; 