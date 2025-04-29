from flask import Blueprint, jsonify, request
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.message import Message
from app.models.event import Event
from app import db
from sqlalchemy import func, desc
from datetime import datetime, timedelta

active_groups_bp = Blueprint('active_groups', __name__)

@active_groups_bp.route('/active-groups', methods=['GET'])
def get_active_groups():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    # Get groups the user is a member of
    user_groups = db.session.query(GroupMember.group_id).filter(
        GroupMember.user_id == user_id
    ).subquery()

    # Get active groups based on recent activity
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    
    active_groups = db.session.query(
        Group.group_id,
        Group.group_name,
        Group.description,
        Group.created_at,
        func.count(GroupMember.user_id).label('member_count'),
        func.count(Message.message_id).label('message_count'),
        func.count(Event.event_id).label('event_count')
    ).outerjoin(
        GroupMember, Group.group_id == GroupMember.group_id
    ).outerjoin(
        Message, Group.group_id == Message.group_id
    ).outerjoin(
        Event, Group.group_id == Event.group_id
    ).filter(
        Group.group_id.in_(user_groups),
        Message.timestamp >= one_week_ago
    ).group_by(
        Group.group_id
    ).order_by(
        desc('message_count'),
        desc('event_count')
    ).limit(10).all()

    groups = [{
        'group_id': g.group_id,
        'group_name': g.group_name,
        'description': g.description,
        'created_at': g.created_at.isoformat(),
        'member_count': g.member_count,
        'message_count': g.message_count,
        'event_count': g.event_count
    } for g in active_groups]

    return jsonify({'groups': groups}) 